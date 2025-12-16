import { useState } from 'preact/hooks'

export default function useSubscribe() {
  const [subscribe, setSubscribe] = useState('Free')

  return { subscribe, setSubscribe }
}
