// Mock catalogue used until real M3U/Xtream data is loaded
export const MOCK_CATEGORIES = [
    {
        id: 'live',
        title: 'Live TV',
        items: [
            {
                id: 'l1', title: 'ESPN Sports HD', genre: 'Sports', rating: '8.2', year: '24/7 LIVE', type: 'live',
                poster: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
                desc: 'Live sports coverage including NFL, NBA, MLB, and more. Around the clock sports action.'
            },
            {
                id: 'l2', title: 'CNN World News', genre: 'News', rating: '7.5', year: '24/7 LIVE', type: 'live',
                poster: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
                desc: 'Breaking news and in-depth coverage of world events from CNN International.'
            },
            {
                id: 'l3', title: 'Discovery 4K', genre: 'Documentary', rating: '9.1', year: '24/7 LIVE', type: 'live',
                poster: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80',
                desc: 'Stunning 4K documentaries covering nature, science, and human stories.'
            },
            {
                id: 'l4', title: 'MTV Hits', genre: 'Music', rating: '7.8', year: '24/7 LIVE', type: 'live',
                poster: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
                desc: 'Non-stop music videos, charts, and live concerts.'
            },
            {
                id: 'l5', title: 'Sky Cinema', genre: 'Movies', rating: '8.5', year: '24/7 LIVE', type: 'live',
                poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
                desc: 'Premium cinema channel with blockbusters, classics and exclusive premieres.'
            },
        ],
    },
    {
        id: 'movies',
        title: 'Movies',
        items: [
            {
                id: 'm1', title: 'Dune: Part Two', genre: 'Sci-Fi', rating: '8.8', year: '2024', type: 'movie',
                poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80',
                desc: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against those who destroyed his family.'
            },
            {
                id: 'm2', title: 'Oppenheimer', genre: 'Drama', rating: '9.0', year: '2023', type: 'movie',
                poster: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
                desc: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.'
            },
            {
                id: 'm3', title: 'The Batman', genre: 'Action', rating: '8.3', year: '2022', type: 'movie',
                poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800&q=80',
                desc: 'Batman ventures into Gotham City\'s underworld when a sadistic killer leaves behind a trail of cryptic clues.'
            },
            {
                id: 'm4', title: 'Interstellar', genre: 'Sci-Fi', rating: '9.1', year: '2014', type: 'movie',
                poster: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=800&q=80',
                desc: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.'
            },
            {
                id: 'm5', title: 'Blade Runner 2049', genre: 'Sci-Fi', rating: '8.7', year: '2017', type: 'movie',
                poster: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
                desc: 'Young Blade Runner K\'s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard.'
            },
            {
                id: 'm6', title: 'The Prestige', genre: 'Mystery', rating: '8.5', year: '2006', type: 'movie',
                poster: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80',
                desc: 'Two stage magicians engage in competitive one-upmanship in an attempt to create the ultimate illusion.'
            },
        ],
    },
    {
        id: 'series',
        title: 'Series',
        items: [
            {
                id: 's1', title: 'The Last of Us', genre: 'Drama', rating: '9.2', year: '2023', type: 'series',
                poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
                desc: 'Joel, a hardened survivor, is hired to smuggle Ellie out of a quarantine zone in a brutal, infected world.'
            },
            {
                id: 's2', title: 'House of the Dragon', genre: 'Fantasy', rating: '8.6', year: '2022', type: 'series',
                poster: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
                desc: 'An internal succession war within House Targaryen at the height of its power.'
            },
            {
                id: 's3', title: 'Succession', genre: 'Drama', rating: '9.4', year: '2023', type: 'series',
                poster: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
                desc: 'The Roy family is known for controlling the biggest media and entertainment company in the world.'
            },
            {
                id: 's4', title: 'The Bear', genre: 'Drama', rating: '9.5', year: '2022', type: 'series',
                poster: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
                desc: 'A young chef from the world of fine dining comes to run his family\'s Chicago sandwich shop after a tragedy.'
            },
            {
                id: 's5', title: 'Shogun', genre: 'Historical', rating: '9.4', year: '2024', type: 'series',
                poster: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
                desc: 'A ship of English sailors arrives in feudal Japan. Their pilot becomes embroiled in deadly political schemes.'
            },
            {
                id: 's6', title: 'Severance', genre: 'Sci-Fi', rating: '9.1', year: '2022', type: 'series',
                poster: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
                hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
                desc: 'Mark leads a team whose memories are surgically divided between work and personal life.'
            },
        ],
    },
];

export const FEATURED = {
    id: 'featured',
    title: 'Dune: Part Two',
    genre: 'Epic Sci-Fi',
    rating: '8.8',
    year: '2024',
    duration: '2h 46m',
    type: 'movie',
    poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=80',
    hero: 'https://images.unsplash.com/photo-1446776858583-a49cf6b3eeb2?w=800&q=80',
    desc: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against those who destroyed his family. Facing a momentous choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.',
};
