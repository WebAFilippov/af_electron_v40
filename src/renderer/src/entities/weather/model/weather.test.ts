import { describe, expect, it } from 'vitest'
import { createEvent, createStore, sample, createEffect } from 'effector'

interface Location {
  id: string
  latitude: number
  longitude: number
  timezone: string
  city: string
  country: string
}

const NOVOSIBIRSK: Location = {
  id: '1',
  latitude: 55.03,
  longitude: 82.92,
  timezone: 'Asia/Novosibirsk',
  city: 'Новосибирск',
  country: 'Россия'
}

describe('сохранение города', () => {
  it('выбор города доходит до эффекта сохранения целым объектом', async () => {
    const saved: (Location | null)[] = []

    // Простая проверка связки событие → обработчик без fork:
    // Effector выполняет эффекты в текущем контексте, если scope не создан.
    const saveFx = createEffect<Location | null, void>(async (location) => {
      saved.push(location)
    })

    const selectLocation = createEvent<Location>()
    sample({ clock: selectLocation, target: saveFx })

    selectLocation(NOVOSIBIRSK)

    // Ждём микро/макрозадачу, чтобы эффект завершился.
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(saved).toHaveLength(1)
    expect(saved[0]).toEqual(NOVOSIBIRSK)
  })

  it('пустой город сохраняется как null, а не как undefined', async () => {
    const saved: Array<Location | null>[] = []

    const saveFx = createEffect<Location | null, void>(async (location) => {
      saved.push([location])
    })

    // UI может сбросить выбор — тогда должен уйти именно null.
    const clear = createEvent<null>()
    sample({ clock: clear, target: saveFx })

    clear(null)
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(saved[0][0]).toBeNull()
  })
})

describe('логика запуска автообновления', () => {
  /**
   * Проверяется решение, а не таймер: interval запускается отдельным событием,
   * а не изменением города. Здесь моделируется именно это условие.
   */
  it('запуск не зависит от изменения города', () => {
    const $location = createStore<Location | null>(NOVOSIBIRSK)

    let started = 0
    const startAutoRefresh = createEvent()

    // Таймер стартует по событию; город нужен только чтобы решить, тикать ли.
    const canStart = sample({
      clock: startAutoRefresh,
      source: $location,
      filter: (location) => location !== null,
      fn: () => {
        started += 1
        return undefined
      }
    })

    // Город не менялся — только факт запуска.
    startAutoRefresh()

    expect(canStart).toBeDefined()
    expect(started).toBe(1)
  })

  it('без города запуск не приводит к тиканью', () => {
    const $location = createStore<Location | null>(null)
    let started = 0

    const startAutoRefresh = createEvent()

    sample({
      clock: startAutoRefresh,
      source: $location,
      filter: (location) => location !== null,
      fn: () => {
        started += 1
      }
    })

    startAutoRefresh()

    expect(started).toBe(0)
  })

  it('паттерн "таймер на изменении города" не сработал бы', () => {
    // Демонстрация исходного дефекта: sample на store без clock срабатывает
    // только при изменении значения. Город, восстановленный до старта, не меняется.
    const $location = createStore<Location | null>(NOVOSIBIRSK)
    let fired = 0

    sample({
      clock: $location,
      filter: (location) => location !== null,
      fn: () => {
        fired += 1
      }
    })

    // Ничего не меняем — как при восстановлении из настроек.
    expect(fired).toBe(0)
  })
})
