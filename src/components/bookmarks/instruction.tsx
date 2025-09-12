function Instructions() {
  return (
    <div className="w-full mt-4 p-4 bg-white/10 rounded-2xl text-white text-sm leading-relaxed space-y-3">
      <h2 className="text-base font-semibold text-white mb-2">
        {chrome.i18n.getMessage('app_instruction_title')}
      </h2>

      <p className="text-[16px] font-sans">
        1. {chrome.i18n.getMessage('app_instruction_save')}
      </p>

      <p className="text-[16px] font-sans">
        2. {chrome.i18n.getMessage('app_instruction_lock')}
      </p>

      <p className="text-[16px] font-sans">
        3. {chrome.i18n.getMessage('app_instruction_view_basic')}
      </p>

      <p className="text-[16px] font-sans">
        4. {chrome.i18n.getMessage('app_instruction_view_incognito')}
      </p>
      <p className="text-[16px] font-sans">
        5. {chrome.i18n.getMessage('app_instruction_create_folder')}
      </p>
      <p className="text-[16px] font-sans">
        6. {chrome.i18n.getMessage('app_instruction_incognito_hint')}
      </p>
      <p className="text-[16px] font-sans">
        7. {chrome.i18n.getMessage('app_instruction_panic')}
      </p>
      <p className="text-[16px] font-sans">
        8. {chrome.i18n.getMessage('app_instruction_import')}
      </p>
      <p className="text-[16px] font-sans">
        9. {chrome.i18n.getMessage('app_instruction_export')}
      </p>
      <p className="text-[16px] font-sans">
        10. {chrome.i18n.getMessage('app_instruction_collect')}
      </p>
    </div>
  )
}

export default Instructions
