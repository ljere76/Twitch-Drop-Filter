// ==UserScript==
// @name         Twitch Inventory Drop Filter
// @version      1.8
// @description  Filtre les Drops Twitch selon une liste de noms spécifiques
// @author       ljere76
// @match        https://www.twitch.tv/drops/inventory
// @icon         https://www.google.com/s2/favicons?domain=twitch.tv
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let gamesFilter = [];
    let isFiltering = true;
    let buttonsCreated = false; // Pour éviter de créer les boutons plusieurs fois
    let activeButton = null; // Pour suivre le bouton actif

    // Fonction pour vérifier si un drop doit être conservé
    function shouldKeepDrop(gameName) {
        return gamesFilter.some(filter => gameName.includes(filter));
    }

    // Fonction pour filtrer les drops
    function filterDrops(forceShow = false) {
        const dropItems = document.querySelectorAll('.inventory-campaign-info');
        dropItems.forEach(item => {
            const gameLink = item.querySelector('.tw-link');
            if (!gameLink) return;

            const gameName = gameLink.textContent.trim();
            const shouldShow = forceShow || shouldKeepDrop(gameName);

            item.parentNode.style.cssText = shouldShow ? '' : 'display: none !important';
        });
    }

    // Fonction pour extraire les noms des drops
    function getDropNames() {
        const dropItems = document.querySelectorAll('.inventory-campaign-info');
        const dropNames = new Set();

        dropItems.forEach(item => {
            const gameLink = item.querySelector('.tw-link');
            if (gameLink) {
                const gameName = gameLink.textContent.trim();
                dropNames.add(gameName);
            }
        });

        return Array.from(dropNames);
    }

    // Fonction pour créer une liste de cases à cocher
    function createCheckboxList() {
        const dropNames = getDropNames();
        const container = document.createElement('div');
        container.style = `
            display: flex;
            flex-direction: column;
            gap: 5px;
            margin-bottom: 10px;
        `;

        dropNames.forEach(dropName => {
            const checkboxContainer = document.createElement('label');
            checkboxContainer.style = `
                display: flex;
                align-items: center;
                gap: 5px;
                cursor: pointer;
            `;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = dropName;
            checkbox.checked = false; // Décoché par défaut

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    gamesFilter.push(dropName);
                } else {
                    gamesFilter = gamesFilter.filter(filter => filter !== dropName);
                }
                filterDrops(false);
            });

            const checkboxLabel = document.createElement('span');
            checkboxLabel.textContent = dropName;

            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(checkboxLabel);
            container.appendChild(checkboxContainer);
        });

        return container;
    }

    // Fonction pour mettre à jour la couleur des boutons
    function updateButtonColors(clickedButton) {
        const buttons = document.querySelectorAll('.filter-button');
        buttons.forEach(button => {
            if (button === clickedButton) {
                button.style.background = '#9147ff'; // Violet pour le bouton actif
            } else {
                button.style.background = '#2f2f35'; // Couleur par défaut pour les autres boutons
            }
        });
    }

    // Fonction pour créer les boutons de filtrage
    function createFilterButtons() {
        if (buttonsCreated) return; // Ne pas créer les boutons plusieurs fois
        buttonsCreated = true;

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

        // Ajouter la liste des cases à cocher
        const checkboxList = createCheckboxList();
        buttonContainer.appendChild(checkboxList);

        // Bouton pour filtrer les drops
        const refreshButton = document.createElement('button');
        refreshButton.textContent = 'Filtrer les Drops';
        refreshButton.className = 'filter-button';
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
        refreshButton.onmouseout = () => {
            if (refreshButton !== activeButton) {
                refreshButton.style.background = '#2f2f35';
            }
        };
        refreshButton.onclick = () => {
            isFiltering = true;
            filterDrops(false);
            activeButton = refreshButton;
            updateButtonColors(refreshButton);
        };

        // Bouton pour réinitialiser le filtrage
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Réinitialiser le Filtrage';
        resetButton.className = 'filter-button';
        resetButton.style = `
            background: #2f2f35;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            transition: background 0.2s;
        `;
        resetButton.onmouseover = () => resetButton.style.background = '#3e3e42';
        resetButton.onmouseout = () => {
            if (resetButton !== activeButton) {
                resetButton.style.background = '#2f2f35';
            }
        };
        resetButton.onclick = () => {
            isFiltering = false;
            gamesFilter = [];
            filterDrops(true);
            activeButton = resetButton;
            updateButtonColors(resetButton);
        };

        // Bouton pour rafraîchir la page
        const reloadButton = document.createElement('button');
        reloadButton.textContent = 'Rafraîchir la Page';
        reloadButton.className = 'filter-button';
        reloadButton.style = `
            background: #2f2f35;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            transition: background 0.2s;
        `;
        reloadButton.onmouseover = () => reloadButton.style.background = '#3e3e42';
        reloadButton.onmouseout = () => {
            if (reloadButton !== activeButton) {
                reloadButton.style.background = '#2f2f35';
            }
        };
        reloadButton.onclick = () => {
            location.reload();
        };

        // Ajouter les boutons au conteneur
        buttonContainer.appendChild(refreshButton);
        buttonContainer.appendChild(resetButton);
        buttonContainer.appendChild(reloadButton);
        document.body.appendChild(buttonContainer);

        // Initialiser le bouton actif
        activeButton = refreshButton;
        updateButtonColors(refreshButton);
    }

    // Fonction pour observer le chargement des drops
    function observeDropsLoad() {
        const observer = new MutationObserver(() => {
            const dropItems = document.querySelectorAll('.inventory-campaign-info');
            if (dropItems.length > 0) {
                filterDrops();
                createFilterButtons(); // Créer les boutons une seule fois
                observer.disconnect(); // Arrêter l'observation après la première détection
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Démarrer l'observation
    observeDropsLoad();
})();
