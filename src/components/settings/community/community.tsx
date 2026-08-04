import {
  History,
  HandCoins,
  ChevronUp,
  Users,
  Star,
  Share2,
  Heart,
  Bug,
} from "lucide-react";
import { FeaturesRow, type FeaturesRowProps } from "../components/featuresRow";
import {
  useSupportDialogStore,
  useNotificationDialogStore,
  usePromoteStore,
} from "@/storage/statelibrary";
import { share } from "@/features/options/share";

export default function Community() {
  const setNotificationOpen = useNotificationDialogStore(
    (state) => state.setNotificationOpen,
  );
  const setSupportOpen = useSupportDialogStore((state) => state.setSupportOpen);
  const promoteOpen = usePromoteStore((state) => state.setPromoteOpen);

  const communityOptions: FeaturesRowProps[] = [
    {
      Icon: History,
      label: chrome.i18n.getMessage("app_changelog"),
      desc: chrome.i18n.getMessage("app_changelog_desc"),
      btnTitle: chrome.i18n.getMessage("app_changelog_btn"),
      onClick: () => setNotificationOpen(true),
    },
    {
      Icon: HandCoins,
      label: chrome.i18n.getMessage("app_affiliate_title"),
      desc: chrome.i18n.getMessage("app_affiliate_desc"),
      btnTitle: chrome.i18n.getMessage("app_affiliate_btn"),
      onClick: () =>
        chrome.tabs.create({
          url: "https://abba4game.lemonsqueezy.com/affiliates?utm_source=aff_flow",
        }),
    },
    {
      Icon: ChevronUp,
      label: chrome.i18n.getMessage("app_options_PH"),
      desc: chrome.i18n.getMessage("app_options_PH_desc"),
      btnTitle: chrome.i18n.getMessage("app_options_PH_btn"),
      onClick: () => promoteOpen(true),
    },
    {
      Icon: Users,
      label: chrome.i18n.getMessage("app_community"),
      desc: chrome.i18n.getMessage("app_community_desc"),
      btnTitle: chrome.i18n.getMessage("app_community_btn"),
      onClick: () =>
        window.open(
          "https://www.reddit.com/user/Sad-Bed-3125/submitted/",
          "_blank",
        ),
    },
    {
      Icon: Star,
      label: chrome.i18n.getMessage("app_rate_extension"),
      desc: chrome.i18n.getMessage("app_rate_extension_desc"),
      btnTitle: chrome.i18n.getMessage("app_rate_extension_btn"),
      onClick: () =>
        window.open(
          "https://chromewebstore.google.com/detail/fagjclghcmnfinjdkdnkejodfjgkpljd/reviews",
          "_blank",
        ),
    },
    {
      Icon: Share2,
      label: chrome.i18n.getMessage("app_share_extension"),
      desc: chrome.i18n.getMessage("app_share_extension_desc"),
      btnTitle: chrome.i18n.getMessage("app_share_extension_btn"),
      onClick: () => share(),
    },
    {
      Icon: Heart,
      label: chrome.i18n.getMessage("app_donate_title"),
      desc: chrome.i18n.getMessage("app_donate_desc"),
      btnTitle: chrome.i18n.getMessage("app_donate_btn"),
      onClick: () => setSupportOpen(true),
    },
    {
      Icon: Bug,
      label: chrome.i18n.getMessage("app_report_bug"),
      desc: chrome.i18n.getMessage("app_report_bug_desc"),
      btnTitle: chrome.i18n.getMessage("app_report_bug_btn"),
      onClick: () =>
        window.open(
          "https://github.com/Abba710/Private-bookmark-locker/issues",
          "_blank",
        ),
    },
  ];

  return (
    <div className="ds-settings-section">
      <div className="ds-settings-section-title ">
        {chrome.i18n.getMessage("app_options_data_tools")}
      </div>

      <div className="bm-settings-section">
        {communityOptions.map((item) => (
          <FeaturesRow
            Icon={item.Icon}
            label={item.label}
            desc={item.desc}
            btnTitle={item.btnTitle}
            onClick={item.onClick}
          />
        ))}
      </div>
    </div>
  );
}
