import * as signalR from '@microsoft/signalr'

export const useSignalR = (hubUrl: string) => {
  const hubConnection = ref<signalR.HubConnection | null>(null)
  const reconnectTimer = ref<number | null>(null)
  let onConnectedCb: (() => void) | undefined

  const clearTimer = () => {
    if (reconnectTimer.value !== null) {
      clearInterval(reconnectTimer.value)
      reconnectTimer.value = null
    }
  }

  const startReconnectTimer = () => {
    clearTimer()
    reconnectTimer.value = window.setInterval(async () => {
      try {
        await hubConnection.value?.start()
        console.log('SignalR reconnected')
        onConnectedCb?.()
        clearTimer()
      } catch (err) {
        console.error('SignalR reconnect failed:', err)
      }
    }, 30000)
  }

  const connect = async (onConnected?: () => void) => {
    onConnectedCb = onConnected
    hubConnection.value = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    hubConnection.value.onclose(() => startReconnectTimer())

    try {
      await hubConnection.value.start()
      console.log('SignalR connected:', hubUrl)
      onConnected?.()
    } catch (err) {
      console.error('SignalR connection failed:', err)
      startReconnectTimer()
    }
  }

  const disconnect = async () => {
    clearTimer()
    await hubConnection.value?.stop()
    hubConnection.value = null
  }

  return { hubConnection, connect, disconnect }
}
