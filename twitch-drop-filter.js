// ==UserScript==
// @name         Twitch Inventory Drop Filter
// @version      1.12
// @description  Filtre les Drops Twitch selon une liste de noms spécifiques
// @author       ljere76
// @match        https://www.twitch.tv/drops/inventory
// @icon         https://www.google.com/s2/favicons?domain=twitch.tv
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let gamesFilter = [];

    // Liste par défaut des drops à filtrer
    const defaultFilters = ['S&F Drops Set 1/3', 'S&F Drops Set 2/3', 'S&F Drops Set 3/3', 'S&F Droplets', 'S&F Drops Set 1/2', 'S&F Drops Set 2/2'];

    // Fonction pour vérifier si un drop doit être conservé
    function shouldKeepDrop(gameName) {
        return gamesFilter.some(filter => gameName.includes(filter));
    }

    // Fonction pour filtrer les drops
    function filterDrops() {
        const dropItems = document.querySelectorAll('.inventory-campaign-info');
        dropItems.forEach(item => {
            const gameLink = item.querySelector('.tw-link');
            if (!gameLink) return;

            const gameName = gameLink.textContent.trim();
            const shouldShow = shouldKeepDrop(gameName);

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

    // Fonction pour sauvegarder les cases cochées
    function saveCheckedFilters() {
        const checkboxes = document.querySelectorAll('.filter-checkbox');
        const checkedFilters = [];
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                checkedFilters.push(checkbox.value);
            }
        });
        localStorage.setItem('checkedFilters', JSON.stringify(checkedFilters));
    }

    // Fonction pour charger les cases cochées
    function loadCheckedFilters() {
        const savedFilters = localStorage.getItem('checkedFilters');
        if (savedFilters) {
            return JSON.parse(savedFilters);
        }
        return defaultFilters; // Retourne la liste par défaut si aucune préférence n'est enregistrée
    }

    // Fonction pour créer une liste de cases à cocher
    function createCheckboxList() {
        const dropNames = getDropNames();
        const container = document.createElement('div');
        container.style = `
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

        // Bouton pour masquer/afficher la liste des cases à cocher
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Masquer/Afficher les filtres';
        toggleButton.style = `
            background: #2f2f35;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
            transition: background 0.2s;
        `;
        toggleButton.onmouseover = () => toggleButton.style.background = '#3e3e42';
        toggleButton.onmouseout = () => toggleButton.style.background = '#2f2f35';
        toggleButton.onclick = () => {
            const checkboxList = container.querySelector('.checkbox-list');
            if (checkboxList.style.display === 'none') {
                checkboxList.style.display = 'flex';
                toggleButton.textContent = 'Masquer les filtres';
            } else {
                checkboxList.style.display = 'none';
                toggleButton.textContent = 'Afficher les filtres';
            }
        };

        // Conteneur pour les cases à cocher
        const checkboxList = document.createElement('div');
        checkboxList.className = 'checkbox-list';
        checkboxList.style.display = 'flex';
        checkboxList.style.flexDirection = 'column';
        checkboxList.style.gap = '5px';

        const checkedFilters = loadCheckedFilters();

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
            checkbox.checked = checkedFilters.includes(dropName); // Cocher les cases sauvegardées
            checkbox.className = 'filter-checkbox';

            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    gamesFilter.push(dropName);
                } else {
                    gamesFilter = gamesFilter.filter(filter => filter !== dropName);
                }
                filterDrops();
                saveCheckedFilters(); // Sauvegarder les cases cochées
            });

            const checkboxLabel = document.createElement('span');
            checkboxLabel.textContent = dropName;

            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(checkboxLabel);
            checkboxList.appendChild(checkboxContainer);
        });

        // Bouton pour rafraîchir la page
        const reloadButton = document.createElement('button');
        reloadButton.textContent = 'Rafraîchir la Page';
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
        reloadButton.onmouseout = () => reloadButton.style.background = '#2f2f35';
        reloadButton.onclick = () => {
            location.reload();
        };

        // Ajouter les éléments au conteneur
        container.appendChild(toggleButton);
        container.appendChild(checkboxList);
        container.appendChild(reloadButton);
        document.body.appendChild(container);

        // Appliquer le filtrage après avoir restauré les cases cochées
        gamesFilter = checkedFilters;
        filterDrops();
    }

    // Fonction pour observer le chargement des drops
    function observeDropsLoad() {
        const observer = new MutationObserver(() => {
            const dropItems = document.querySelectorAll('.inventory-campaign-info');
            if (dropItems.length > 0) {
                createCheckboxList();
                observer.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Démarrer l'observation
    observeDropsLoad();
})();
