const trigger = document.querySelector('#trigger')
const backgroundEl = document.querySelector('#background')
let triggerLocked = false
let triggerFirstClick = true
let clipPathOn = false
let colorIndex = 0
const rootCss = document.querySelector(':root')

let clipPathInnerSize = 0
let clipPathOuterSize = 0
let clipPathInnerMaxSize = parseInt(getComputedStyle(document.body).getPropertyValue('--clip-path-inner-max-size'));
let clipPathOuterMaxSize = parseInt(getComputedStyle(document.body).getPropertyValue('--clip-path-outer-max-size'));

let isMobile = 1 == getComputedStyle(document.body).getPropertyValue('--mobile')

function drawClipPath (x, y) {
    rootCss.style.setProperty('--clippath-circle-outer', 'circle(' + clipPathOuterSize + '% at ' + x + '% ' + y + '%)');
    rootCss.style.setProperty('--clippath-circle-inner', 'circle(' + clipPathInnerSize+ '% at ' + x + '% ' + y + '%)');
}

trigger.addEventListener('click', function clickerFunction (ev) {
    if (triggerFirstClick) {
        let tmpContent = document.querySelector('html').innerHTML.replace(/</g,"&lt;")
        tmpContent = tmpContent.replace(/\n\s*\n/g, '\n')
        tmpContent = tmpContent.replace('&lt;head>', '\n\t&lt;head>')
        tmpContent = tmpContent.replace('\t&lt;/body>', '&lt;/body>')
        
        if (isMobile) {
            console.log('test');
            tmpContent = tmpContent.replace(/\t/g, ' ')
        }

        document.querySelector('#background').innerHTML = `<pre>\n&lt;!DOCTYPE html>\n&lt;html lang="en">${tmpContent}\n&lt;/html></pre>`
        triggerFirstClick = false
    }

    if (triggerLocked) {
        return
    } else triggerLocked = true
    
    clipPathOn = !clipPathOn
    let x, y
    if (!clipPathOn) {
        let clipIntID = setInterval(() => {
            clipPathInnerSize -= clipPathInnerMaxSize / 10
            clipPathOuterSize -= clipPathOuterMaxSize / 10

            if (clipPathInnerSize <= 0) {
                clipPathInnerSize = 0
                clipPathOuterSize = 0
                window.clearInterval(clipIntID)
                triggerLocked = false
                return
            }

            x = parseInt(ev.pageX / window.innerWidth * 100);
            y = parseInt(ev.pageY / window.innerHeight * 100);
            drawClipPath(x, y)
        }, 20)
    } else {
        let clipIntID = setInterval(() => {
            clipPathInnerSize += clipPathInnerMaxSize / 10
            clipPathOuterSize += clipPathOuterMaxSize / 10

            if (clipPathInnerSize >= clipPathInnerMaxSize) {
                clipPathInnerSize = clipPathInnerMaxSize
                clipPathOuterSize = clipPathOuterMaxSize
                window.clearInterval(clipIntID)
                triggerLocked = false
                return
            }

            x = parseInt(ev.pageX / window.innerWidth * 100);
            y = parseInt(ev.pageY / window.innerHeight * 100);
            drawClipPath(x, y)
        }, 20)
    }

    x = parseInt(ev.pageX / window.innerWidth * 100);
    y = parseInt(ev.pageY / window.innerHeight * 100);
    drawClipPath(x, y)
})

document.querySelectorAll('.typer').forEach(e => {
    let text = e.dataset.text
    if (text === undefined) return
    let count = 0
    let intervalID = setInterval(() => {
        if (count == text.length) {
            window.clearInterval(intervalID)
            return
        }

        if (count == 0) e.innerHTML = '' + text[count++]
        else e.innerHTML = '' + e.innerHTML + text[count++]
    }, 100)
})

function getCoordinates (ev) {
    let x = parseInt(ev.pageX / window.innerWidth * 100);
    let y = parseInt(ev.pageY / window.innerHeight * 100);
    drawClipPath(x, y)
}

document.addEventListener('touchmove', (ev) => {
    ev = ev.touches[0]
    getCoordinates(ev)
})

document.addEventListener('mousemove', (ev) => {
    getCoordinates(ev)
})