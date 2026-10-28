// The catalogue. Each project = one card; its clips play in order in the lightbox.
// Clip ids map to media/<id>.mp4, media/<id>-loop.mp4 and media/<id>.jpg.
window.CATS = [
  { id: "character", name: "Character animation", blurb: "Acting, walks, flights and comedy timing in Moho, Clip Studio Paint and After Effects." },
  { id: "compositing", name: "Compositing", blurb: "Flat animation layers lit, graded and blurred into finished cinematic shots." },
  { id: "boards", name: "Storyboards & animatics", blurb: "The film before the film: boards, rough animatics and the pass that turns them into finals." },
  { id: "cleanup", name: "Clean-up & in-betweens", blurb: "Clean line and in-between frames for a 2D series, kept on model from pose to pose." },
  { id: "series", name: "Burdens in Babylon", blurb: "My own Bible series in anime style, made at my studio D'Paper Man." },
  { id: "editing", name: "Trailers & editing", blurb: "Trailers, channel intros and product films, cut and finished for release." }
];

window.WORKS = [
  { id: "comp-queen", cat: "compositing", title: "Moonlit cave, compositing breakdown", client: "Nsibidi Fables", clips: ["comp-queen"],
    blurb: "The animation layer first, then tone, light, highlights and blur until the queen sits inside the night scene." },
  { id: "comp-torch", cat: "compositing", title: "Temple torchlight, compositing breakdown", client: "Nsibidi Fables", clips: ["comp-torch"],
    blurb: "Character animation over a dark temple, finished with light rays, shadows, blurs and curves." },
  { id: "comp-rain", cat: "compositing", title: "Rainy window, compositing", clips: ["comp-rain"],
    blurb: "A girl at her desk seen through a rain-streaked window, with warm lamp light, glow and falling rain layered in." },

  { id: "griot", cat: "character", title: "Griot", client: "Penmob Creative Studios", clips: ["griot"],
    blurb: "A night chase from a Lagos bridge down into the sewers: dramatic close-ups, a monster and a machete fight. The finished film from the Griot storyboard." },
  { id: "nereus", cat: "character", title: "Tales of Nereus", clips: ["nereus"],
    blurb: "An anime trailer I animated end to end, set to the poem \"Unbeaten by rain\": a dragon at sunset, a sky battle and a light-sword strike, ending on the Tonvatar and Tales of Nereus titles." },
  { id: "companion", cat: "character", title: "Companion", clips: ["companion", "companion-flight"],
    blurb: "A dragon taken from rough animation and background through to the final coloured shot." },
  { id: "admin-show", cat: "character", title: "The Admin Show, opening", clips: ["admin-show", "admin-rough"],
    blurb: "A neon card-table cast, shown as the coloured final and then the red-pencil rough pass underneath it." },
  { id: "lamb", cat: "character", title: "Cult of the Lamb in Moho", client: "D'Paper Man", clips: ["lamb"],
    blurb: "The Lamb animated and rigged in Moho over a painted forest." },
  { id: "nibbles", cat: "character", title: "Nibbles the Red Panda", clips: ["nibbles"],
    blurb: "A red panda in a bamboo forest, from character animation to the title card." },
  { id: "comedy", cat: "character", title: "Character comedy shorts", client: "Franken Studio", clips: ["comedy-town", "comedy-pizza", "comedy-dead", "comedy-sing", "comedy-santa", "comedy-phone"],
    blurb: "A recurring cast in short vertical gags and a longer town piece, timed for social." },
  { id: "ad", cat: "character", title: "Office explainer ad", clips: ["ad-desk", "ad-call", "ad-board", "ad-sketch"],
    blurb: "Shots for an explainer ad: desk work, a video call, a boardroom pitch and the sketch pass behind them." },

  { id: "snack-anim", cat: "boards", title: "From animatic to final", clips: ["snack-anim"],
    blurb: "Animatic and backgrounds on top, the final animation underneath, shot for shot." },
  { id: "sb-desert", cat: "boards", title: "Griot, storyboard", client: "Penmob Creative Studios", clips: ["sb-desert", "sb-desert-2"],
    blurb: "A storyboard animatic for a desert chase, with camera moves, staging and timing worked out in grey tones." },
  { id: "sb-stillborn", cat: "boards", title: "Still Born, animatic", clips: ["sb-stillborn", "sb-stillborn-2"],
    blurb: "A quiet family story boarded and timed as an animatic before any final art." },
  { id: "comedy-roughs", cat: "boards", title: "Comedy shorts, rough passes", client: "Franken Studio", clips: ["comedy-sketch", "comedy-board"],
    blurb: "Rough sketch animation for the comedy shorts, before clean-up and colour." },

  { id: "cleanup", cat: "cleanup", title: "Clean-up animation", client: "Nsibidi Fables", clips: ["cleanup", "cleanup-2"],
    blurb: "Clean line over rough keys for a series set in an ancient African kingdom." },
  { id: "inbetween", cat: "cleanup", title: "In-between animation", client: "Nsibidi Fables", clips: ["inbetween"],
    blurb: "In-betweens for a two-character scene, following the lead animator's keys and timing." },

  { id: "bib-dialogue", cat: "series", title: "Azariah and Mishael", client: "D'Paper Man", clips: ["bib-dialogue"],
    blurb: "A dialogue scene from Burdens in Babylon, posted as \"Bible Stories in Anime Style?\"" },
  { id: "bib-ep2", cat: "series", title: "Burdens in Babylon, episode 2", client: "D'Paper Man", clips: ["bib-ep2"],
    blurb: "The second vertical episode of the series." },
  { id: "bib-teaser", cat: "series", title: "Burdens in Babylon, teaser", client: "D'Paper Man", clips: ["bib-teaser"],
    blurb: "A short teaser that sets up the world of the series." },
  { id: "bib-shorts", cat: "series", title: "Series shorts", client: "D'Paper Man", clips: ["bib-radio", "bib-hf", "bib-flow"],
    blurb: "Short pieces with the cast, made for YouTube Shorts and TikTok alongside the episodes." },

  { id: "trailer-meska", cat: "editing", title: "Who killed Meska Opo?", client: "Nsibidi Fables", clips: ["trailer-meska"],
    blurb: "A night-time mystery trailer from the Kush series, built around one question." },
  { id: "trailer-ep2", cat: "editing", title: "Episode 2 trailer", client: "Nsibidi Fables", clips: ["trailer-ep2"],
    blurb: "A trailer for the Kush series, cut across the queen, the temple and the desert." },
  { id: "trailer-3", cat: "editing", title: "Desert army trailer", clips: ["trailer-3"],
    blurb: "A vertical trailer of wrecked carts, dark halls and an army in the sand." },
  { id: "welcome", cat: "editing", title: "Channel welcome film", client: "Nsibidi Fables", clips: ["welcome"],
    blurb: "The welcome film for the Nsibidi Fables channel." },
  { id: "beteye", cat: "editing", title: "BetEye product film", clips: ["beteye"],
    blurb: "A dark-mode product film for a live football signal app: landing page, alert cards and the system behind it." }
];
