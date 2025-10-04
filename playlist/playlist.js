"use strict";

function initPlaylist(playlistConfig) {
    let currentPage = 1;
    let _filtered = null;

    function getWorkingList() {
        const list = _filtered && Array.isArray(_filtered) ? _filtered : playlistConfig.songs;
        return getSortedSongs(list);
    }

    function getSortedSongs(list) {
        let songs = [...list]; // clone

        switch (playlistConfig.sort) {
            case "title":
                return songs.sort((a, b) => a.title.localeCompare(b.title));
            case "artist":
                return songs.sort((a, b) => a.artist.localeCompare(b.artist));
            case "random":
                return songs.sort(() => Math.random() - 0.5);
            default:
                return songs;
        }
    }

    function renderSidebar() {
        const $list = $('#sidebarLinks');
        $list.empty();

        if (playlistConfig.sidebar && Array.isArray(playlistConfig.sidebar)) {
            playlistConfig.sidebar.forEach(link => {
                const $item = $(`
                    <li>
                        <a href="${link.url}" target="${link.target ?? '_blank'}" 
                           class="flex items-center space-x-2 hover:text-gray-300">
                            <i class="bi ${link.icon}"></i>
                            <span>${link.label}</span>
                        </a>
                    </li>
                `);
                $list.append($item);
            });
        }
    }

    function renderPlaylist() {
        const $playlist = $('#playlist');
        $playlist.empty();

        const songsPerPage = playlistConfig.songsPerPage;
        const list = getWorkingList();
        const start = (currentPage - 1) * songsPerPage;
        const end = start + songsPerPage;
        const currentSongs = list.slice(start, end);

        if (currentSongs.length === 0) {
            const $msg = $('<div>')
                .addClass('col-span-full text-center text-gray-400')
                .text('No results found.');
            $playlist.append($msg);
        } else {
            currentSongs.forEach(song => {
                const $card = $(`
                    <div class="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform cursor-pointer">
                        <img src="${song.thumbnail}" alt="${song.title}" class="w-full h-40 object-cover">
                        <div class="p-3">
                            <h2 class="text-base font-semibold truncate">${song.title}</h2>
                            <p class="text-xs text-gray-400">${song.artist}</p>
                        </div>
                    </div>
                `);
                $card.on('click', () => window.open(song.link, '_blank'));
                $playlist.append($card);
            });
        }

        renderPagination();
    }

    function renderPagination() {
        const $pagination = $('#pagination');
        $pagination.empty();
        const songsPerPage = playlistConfig.songsPerPage;
        const totalPages = Math.max(1, Math.ceil(getWorkingList().length / songsPerPage));

        for (let i = 1; i <= totalPages; i++) {
            const $btn = $('<button>')
                .text(i)
                .addClass(`px-4 py-2 rounded-md text-base ${i === currentPage ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'}`)
                .on('click', function () {
                    currentPage = i;
                    renderPlaylist();
                    $('#playlist')[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            $pagination.append($btn);
        }
    }

    function searchSongs(term) {
        term = (term || '').trim().toLowerCase();
        if (term === '') {
            _filtered = null;
        } else {
            _filtered = playlistConfig.songs.filter(song =>
                (song.title && song.title.toLowerCase().includes(term)) ||
                (song.artist && song.artist.toLowerCase().includes(term))
            );
        }
        currentPage = 1;
        renderPlaylist();
    }

    // jQuery-based wiring
    $(function () {
        // Wire up search
        $('#search').on('input', function () { searchSongs($(this).val()); });
        $('#searchDesktop').on('input', function () { searchSongs($(this).val()); });

        // Sidebar toggle
        $('#menuBtn').on('click', function () {
            $('#sidebar').removeClass('-translate-x-full');
            $('#overlay').removeClass('hidden');
        });
        $('#overlay').on('click', function () {
            $('#sidebar').addClass('-translate-x-full');
            $('#overlay').addClass('hidden');
        });

        // Initial renders
        renderSidebar();
        renderPlaylist();
    });
}
