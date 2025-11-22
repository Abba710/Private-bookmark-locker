import adsimg from '@/assets/Prompt.png'
function UserHeader() {
  return (
    <div className="relative flex items-center justify-between w-full h-[40px] px-4 bg-white/10 rounded-[16px]">
      <a
        className="flex items-center gap-2 hover:scale-105 transition-transform"
        target="_blank"
        href={
          'https://chromewebstore.google.com/detail/fmchlndpipmfieojblemdjieobocjdpl?utm_source=item-share-cb'
        }
      >
        <img src={adsimg} alt="AI Icon" className="w-5 h-5 rounded-full" />
        <p className="text-white text-[14px] font-medium cursor-pointer">
          {chrome.i18n.getMessage('app_ads_title')}
        </p>
      </a>
    </div>
  )
}

export default UserHeader
