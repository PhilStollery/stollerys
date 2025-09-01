---
date: 2024-05-01T09:00
tags: [2024, WeblogPoMo2024, weblog, css, tips]
authors: pstollery
---

# One

[Weblog Posting Month, 2024](https://weblog.anniegreens.lol/weblog-posting-month-2024)

I'm not very good at blogging. I've not had the time, I don't have anything to say, why would anyone want to read what I have to say… and the excuses go on.

<!-- truncate -->

Thanks to [Apple Annie](https://social.lol/@anniegreens) I'm going to try to post 31 times in a row, each day. I thought maybe 31 games I like to play. 31 tips on configuring a weblog to look like mine. I'm probably going to go with a daily [Lex](https://social.lol/@lexfri@hachyderm.io) approach — write about the first thing that comes to mind.

Weblog tip: If you'd like to have your own dynamic island for your menu, use this CSS. I think it works really well on mobile.

```css
nav {
    overflow: hidden;
    background-color: var(--navbar);
    border-radius: 2em;
    font-family: 'VC Honey Deck', sans-serif;
    line-height: 100%;

    /* Sticky menu */
    position: sticky;
    top: 0px;
}
``` 

What's CSS? It tells a webpage how things should look. You can edit yours on the weblog posting page, click on your template. Then find the above `nav` code — add my sticky bits inside the curly brackets. 