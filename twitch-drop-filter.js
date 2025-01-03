// ==UserScript==
// @name         Twitch Drop Filter
// @version      1.3
// @description  Filtre les Drops Twitch selon une liste de noms spécifiques
// @author       ljere76
// @match        https://www.twitch.tv/drops/inventory
// @icon         https://www.google.com/s2/favicons?domain=twitch.tv
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const gamesFilter = ['S&F Drops Set 1/3', 'S&F Drops Set 2/3', 'S&F Drops Set 3/3', 'S&F Droplets', 'S&F Drops Set 1/2', 'S&F Drops Set 2/2'];
    let isFiltering = true;

    function shouldKeepDrop(gameName) {
        return gamesFilter.some(filter => gameName.includes(filter));
    }

    function filterDrops(forceShow = false) {
        const dropItems = document.querySelectorAll('.inventory-campaign-info');
        dropItems.forEach(item => {
            const gameLink = item.querySelector('.tw-link');
            if (!gameLink) return;

            const gameName = gameLink.textContent.trim();
            const shouldShow = forceShow || shouldKeepDrop(gameName);
            const towerContainer = item.parentElement.querySelector('.tw-tower');

            // Apply display: flex to specific elements
            const flexContainer = item.closest('div.ilRKfU:nth-child(3) > div:nth-child(2)');
            if (flexContainer) {
                flexContainer.style.display = shouldShow ? 'flex' : 'none';
            } else {
                item.style.display = shouldShow ? 'block' : 'none';
            }

            if (towerContainer) {
                towerContainer.style.display = shouldShow ? 'flex' : 'none';
            }
        });
    }

    function createFilterButtons() {
        const buttonContainer = document.createElement('div');
        buttonContainer.style = `
            position: fixed;
            top: 60px;
            right: 10px;
            background: #18181b;
            padding: 10px;
            border-radius: 5px;
            z-index: 9999;
            color: white;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            gap: 5px;
        `;

        const refreshButton = document.createElement('button');
        refreshButton.textContent = 'Filtrer les Drops';
        refreshButton.style = `
            background: #9147ff;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            transition: background 0.2s;
        `;
        refreshButton.onmouseover = () => refreshButton.style.background = '#7d2df0';
        refreshButton.onmouseout = () => refreshButton.style.background = '#9147ff';
        refreshButton.onclick = () => {
            isFiltering = true;
            filterDrops(false);
        };

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Réinitialiser le Filtrage';
        resetButton.style = refreshButton.style;
        resetButton.onmouseover = () => resetButton.style.background = '#7d2df0';
        resetButton.onmouseout = () => resetButton.style.background = '#9147ff';
        resetButton.onclick = () => {
            isFiltering = false;
            filterDrops(true);
        };

        const reloadButton = document.createElement('button');
        reloadButton.textContent = 'Rafraîchir la Page';
        reloadButton.style = refreshButton.style;
        reloadButton.onmouseover = () => reloadButton.style.background = '#7d2df0';
        reloadButton.onmouseout = () => reloadButton.style.background = '#9147ff';
        reloadButton.onclick = () => {
            location.reload();
        };

        buttonContainer.appendChild(refreshButton);
        buttonContainer.appendChild(resetButton);
        buttonContainer.appendChild(reloadButton);
        document.body.appendChild(buttonContainer);
    }

    function observeDropsLoad() {
        const observer = new MutationObserver(() => {
            if (document.querySelectorAll('.inventory-campaign-info').length > 0) {
                filterDrops();
                observer.disconnect(); // Arrête l'observation une fois les éléments trouvés
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    createFilterButtons();
    observeDropsLoad(); // Active le filtrage dès le chargement de la page
})();
