"use strict";

let currentPage = 1;

function getWorkingList() {
    return playlistData._filtered && Array.isArray(playlistData._filtered) ? playlistData._filtered : playlistData.songs;
}

// jQuery-based rendering and event wiring
$(function () {
    function renderSidebar() {
        const $list = $('#sidebarLinks');
        $list.empty();

        playlistData.sidebar.forEach(link => {
            const $item = $(`
                <li>
                    <a href="${link.url}" class="flex items-center space-x-2 hover:text-gray-300">
                        <i class="bi ${link.icon}"></i><span>${link.label}</span>
                    </a>
                </li>
            `);
            $list.append($item);
        });
    }

    // Call it on load
    renderSidebar();

    function renderPlaylist() {
        const $playlist = $('#playlist');
        $playlist.empty();
        const songsPerPage = playlistData.config.songsPerPage;
        const list = getWorkingList();
        const start = (currentPage - 1) * songsPerPage;
        const end = start + songsPerPage;
        const currentSongs = list.slice(start, end);

        if (currentSongs.length === 0) {
            const $msg = $('<div>').addClass('col-span-full text-center text-gray-400').text('No results found.');
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
        const songsPerPage = playlistData.config.songsPerPage;
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
            playlistData._filtered = null;
        } else {
            playlistData._filtered = playlistData.songs.filter(song =>
                (song.title && song.title.toLowerCase().includes(term)) ||
                (song.artist && song.artist.toLowerCase().includes(term))
            );
        }
        currentPage = 1;
        renderPlaylist();
    }

    // Wire up search inputs
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

    // initial render
    renderPlaylist();
});