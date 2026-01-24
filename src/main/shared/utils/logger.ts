// import { is } from '@electron-toolkit/utils'
// import log from 'electron-log/main.js'
// import { join } from 'path'
// import { Config, linkCreateIssue } from '../config'
// import type { LogMessage } from 'electron-log'
// import { app as electronApp, dialog } from 'electron'

// const firstLine = (message: string): string => {
//   if (typeof message === 'string') {
//     const [line] = message.split('\n')
//     return line
//   }
//   return message
// }

// const dateFormatter = new Intl.DateTimeFormat('ru', {
//   year: '2-digit',
//   month: '2-digit',
//   day: '2-digit',
//   hour: '2-digit',
//   minute: '2-digit',
//   second: '2-digit',
//   fractionalSecondDigits: 3,
//   hour12: false
// })

// const formatMessage = ({ message }: { message: LogMessage }): string[] => {
//   const date = dateFormatter.format(message.date)
//   const prefix = `[${date}] ${message.variables?.processType ? `(${message.variables.processType}) ` : ''}[${message.level}] `
//   const data = message.data.map((chunk) =>
//     chunk instanceof Error ? `${chunk.name} ${firstLine(chunk.message)}` : chunk
//   )
//   return [prefix, ...data]
// }

// export const loggerInit = (): void => {
//   log.initialize()

//   if (is.dev) {
//     log.transports.file.resolvePathFn = (pathVariables) =>
//       join(__dirname, '..', '..', 'logs', `${pathVariables.fileName}`)
//   } else {
//     log.transports.file.resolvePathFn = (pathVariables) =>
//       join(Config.pathResources, 'logs', `${pathVariables.fileName}`)
//   }

//   // Уровни логирования: в dev выводим всё, в prod — только важное
//   log.transports.file.level = is.dev ? 'silly' : 'info'
//   log.transports.console.level = is.dev ? 'debug' : 'info'

//   // Формат сообщений для файла и консоли
//   log.transports.console.format = formatMessage
//   log.transports.file.format = formatMessage

//   // Перехват необработанных ошибок
//   log.errorHandler.startCatching({
//     showDialog: true,
//     onError({ createIssue, error, processType, versions }) {
//       if (processType === 'renderer') {
//         return
//       }
//       dialog
//         .showMessageBox({
//           title: 'An error occurred',
//           message: error.message,
//           detail: error.stack,
//           type: 'error',
//           buttons: ['Ignore', 'Report', 'Exit']
//         })
//         .then((result) => {
//           if (result.response === 1) {
//             createIssue(linkCreateIssue, {
//               title: `Error report for ${versions.app}`,
//               body: 'Error:\n```' + error.stack + '\n```\n' + `OS: ${versions.os}`
//             })
//             return
//           }

//           if (result.response === 2) {
//             electronApp.quit()
//           }
//         })
//     }
//   })
// }

// export const logger = log
