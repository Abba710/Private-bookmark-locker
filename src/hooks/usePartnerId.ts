import { useEffect, useState } from 'react'

export default function usePartnerId() {
  const [partnerId, setPartnerId] = useState('')

  useEffect(() => {
    chrome.storage.local.get('partner-id', (result) => {
      if (result['partner-id']) {
        setPartnerId(result['partner-id'])
      }
    })
  }, [])

  // Возвращаем значение, чтобы компонент мог его использовать
  return partnerId
}
