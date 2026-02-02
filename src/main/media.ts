// // src/main/media.ts
// import { spawn } from 'child_process'
// import { join } from 'path'
// import WebSocket from 'ws'
// import { BrowserWindow } from 'electron'
// import { Config } from './shared/config'

// let mainWindow: BrowserWindow | null = null

// export const setMediaControllerMainWindow = (window: BrowserWindow): void => {
//   mainWindow = window
// }

// const port = 6666

// // Запуск MediaControllerService.exe
// const service = spawn(join(Config.pathResources, 'MediaControllerService.exe'), [port.toString()])

// // Логи процесса
// service.stdout.on('data', (data) => {
//   console.log(`[MediaService] stdout: ${data}`)
// })

// service.stderr.on('data', (data) => {
//   console.error(`[MediaService] stderr: ${data}`)
// })

// service.on('close', (code) => {
//   console.warn(`[MediaService] exited with code ${code}`)
// })

// // Подключение к WebSocket
// let ws: WebSocket | null = null

// const connect = () => {
//   if (ws) ws.removeAllListeners()

//   console.log(`Подключение к ws://localhost:${port}/`)
//   ws = new WebSocket(`ws://localhost:${port}/`)

//   ws.on('open', () => {
//     console.log('WebSocket соединение установлено')
//   })

//   ws.on('message', (data: WebSocket.Data) => {
//     try {
//       const msg = JSON.parse(data.toString())
//       console.log('[WebSocket] Получено сообщение:', msg) // 🔥 Вывод в консоль


//       // Обработка по типу
//       if (msg.type === 'sessions') {
//         console.log('Сессии:', msg.data)
//       } else if (msg.type === 'sessionUpdate') {
//         console.log('Обновление сессии:', msg.data)
//       }
//     } catch (err) {
//       console.error('Ошибка парсинга JSON:', data)
//     }
//   })

//   ws.on('error', (err) => {
//     console.error('WebSocket ошибка:', err.message)
//   })

//   ws.on('close', () => {
//     console.log('WebSocket соединение закрыто, переподключение...')
//     setTimeout(connect, 3000)
//   })
// }

// // Запуск подключения через 2 секунды (дать .exe время стартовать)
// setTimeout(connect, 2000)

// // Экспорт для управления из main.ts
// export const closeMediaService = (): void => {
//   if (ws) {
//     ws.close()
//     ws = null
//   }
//   service.kill()
// }