import mqtt from 'mqtt'
import { logger } from '@/shared/utils/logger'

const BROKER_URL = 'mqtt://hub.local:1883'

const client = mqtt.connect(BROKER_URL, {
  clientId: 'nodejs-hub-client',
  clean: true,
  reconnectPeriod: 1000
})

client.on('connect', () => {
  logger.info('✅ Connected to ESP32 MQTT broker')

  client.subscribe(['hub/telemetry', 'hub/status'], (err) => {
    if (err) {
      logger.error({ error: err }, '❌ Subscribe error')
    } else {
      logger.info('📡 Subscribed to telemetry & status')
    }
  })
})

client.on('message', (topic, payload) => {
  const message = payload.toString()

  switch (topic) {
    case 'hub/telemetry':
      handleTelemetry(message)
      break

    case 'hub/status':
      logger.info({ message }, '📟 Status')
      break

    default:
      logger.info({ topic, message }, '📨 MQTT message')
  }
})

client.on('error', (err) => {
  logger.error({ error: err }, '❌ MQTT error')
})

client.on('close', () => {
  logger.info('🔌 MQTT connection closed')
})

// ---------- handlers ----------

function handleTelemetry(payload) {
  try {
    const data = JSON.parse(payload)
    logger.info({ data }, '📊 Telemetry')
  } catch {
    logger.info({ payload }, '📊 Telemetry (raw)')
  }
}

// ---------- commands ----------

export function sendMotorCommand(action, speed = 0) {
  const payload = JSON.stringify({
    action, // "start" | "stop" | etc
    speed // int
  })

  client.publish('hub/cmd/motor', payload)
  logger.info({ payload }, '➡️ Motor cmd')
}

export function sendConfig(param, value) {
  const payload = JSON.stringify({
    param,
    value
  })

  client.publish('hub/cmd/config', payload)
  logger.info({ payload }, '➡️ Config cmd')
}
