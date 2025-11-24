export function share() {
  const url =
    'https://chromewebstore.google.com/detail/fagjclghcmnfinjdkdnkejodfjgkpljd?utm_source=item-share-cb'
  navigator.clipboard.writeText(url).then(() => {
    alert('Copyied to clipboard!')
  })
}
