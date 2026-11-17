(function () {
    const dialog = document.getElementById('sponsor-dialog');
    if (!dialog) return;

    let activeCard = null;
    const descriptionKeys = {
        google: 'google_description',
        'sticker-mule': 'sticker_mule_description'
    };

    function updateCardLabels() {
        const language = document.documentElement.lang === 'en' ? 'en' : 'fr';
        const translations = language === 'en' ? window.translations_en : window.translations_fr;
        document.querySelectorAll('[data-sponsor-details]').forEach(button => {
            const name = button.closest('.sponsor-card').querySelector('h3').textContent;
            button.setAttribute('aria-label', `${translations.sponsoring.view_details_label} ${name}`);
        });
    }

    function updateDialog() {
        if (!activeCard) return;

        const language = document.documentElement.lang === 'en' ? 'en' : 'fr';
        const translations = language === 'en' ? window.translations_en : window.translations_fr;
        const key = activeCard.querySelector('[data-sponsor-details]').dataset.sponsorDetails;
        const logo = activeCard.querySelector('.sponsor-logo-frame img');
        const website = activeCard.querySelector('.sponsor-actions a');

        document.getElementById('sponsor-dialog-role').textContent = activeCard.querySelector('.sponsor-role').textContent;
        document.getElementById('sponsor-dialog-title').textContent = activeCard.querySelector('h3').textContent;
        document.getElementById('sponsor-dialog-description').textContent = translations.sponsoring[descriptionKeys[key]];
        const dialogImage = document.getElementById('sponsor-dialog-image');
        dialogImage.src = logo.src;
        dialogImage.alt = logo.alt;
        document.getElementById('sponsor-dialog-link').href = website.href;
        dialog.querySelector('[data-sponsor-close]').setAttribute('aria-label', translations.sponsoring.close_details);
    }

    document.querySelectorAll('[data-sponsor-details]').forEach(button => {
        button.addEventListener('click', () => {
            activeCard = button.closest('.sponsor-card');
            updateDialog();
            dialog.showModal();
        });
    });

    dialog.querySelector('[data-sponsor-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
    });
    window.addEventListener('devfestlanguagechange', () => {
        updateCardLabels();
        if (dialog.open) updateDialog();
    });
    updateCardLabels();
})();
