(function () {
    const dialog = document.getElementById('discount-dialog');
    const openButton = document.getElementById('discount-open');
    const closeButton = document.getElementById('discount-close');
    if (!dialog || !openButton || !closeButton) return;

    function updateLanguage() {
        const language = document.documentElement.lang === 'en' ? 'en' : 'fr';
        const translations = language === 'en' ? window.translations_en : window.translations_fr;
        closeButton.setAttribute('aria-label', translations.ticketing.discount_close);
        const subject = language === 'en'
            ? 'DevFest Paris 2026 - Discount request'
            : 'DevFest Paris 2026 - Demande de réduction';
        document.getElementById('discount-email').href =
            `mailto:gdgpariscontact@gmail.com?subject=${encodeURIComponent(subject)}`;
    }

    openButton.addEventListener('click', () => {
        updateLanguage();
        dialog.showModal();
    });
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
    });
    window.addEventListener('devfestlanguagechange', updateLanguage);
    updateLanguage();
})();
