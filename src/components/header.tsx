import adsimg from '@/assets/Prompt.png'
function UserHeader() {
  return (
    <div className="relative flex items-center justify-between w-full h-[40px] px-4 bg-white/10 rounded-[16px]">
      {/* Plan status indicator */}
      <div className="flex items-center gap-2">
        <img src={adsimg} alt="AI Icon" className="w-5 h-5 rounded-full" />
        <a
          className="text-white text-xs font-medium cursor-pointer"
          target="_blank"
          href={
            'https://chromewebstore.google.com/detail/fmchlndpipmfieojblemdjieobocjdpl?utm_source=item-share-cb'
          }
        >
          {chrome.i18n.getMessage('app_ads_title')}
        </a>
      </div>
    </div>
  )
}

export default UserHeader
