# cpSwipe
A jQuery Plugin to handle swipe events. Mostly used on horizontal image slideshows.

## Features
* Lightweight (~2kb minified)
* Easy to use
* Detect vertical and/or horizontal swipe

## Example Usage
Use the plugin like this:

```js
$('selector').cpSwipe(options, events);
```

## Options

Key | Type | Default | Description
----|------|---------|------------
mouse | Boolean | False | Enable mouse events
horizontal | Boolean | True | enable horizontal swipe
horizontalThreshold | Number | 40 | horizontal swipe threshold
preventDefaultAction | Boolean | False | prevent the default action
vertical | Boolean | False | enable vertical swipe
verticalThreshold | Number | 40 | vertical swipe threshold

## Events

Name | Description
-----|------------
up | Swiped up
down | Swiped down
right | Swiped right
left | Swiped left
start | start tracking
move | while tracking
end | end tracking

First argument is the element swiped on. Second arguments contains some data about distance.

## Notes
This Plugins is tested on some bigger websites. If you find a bug or have a feature request, send me an email.

## License
This plugin is available under [the MIT license](https://opensource.org/licenses/mit-license.php).

_– [Christian 'ChillerPerser' Linke](http://christianlinke.info)_