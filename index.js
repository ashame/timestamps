const S = require('./string')
const Command = require('command')

var debug = false;
var enabled = true;

module.exports = function TimeStamps(dispatch){
    const blocked = new Set()
    const command = Command(dispatch)

    command.add(`ts`, (cmd, sub) => {
        switch (cmd) {
            case 'debug': 
                debug = !debug;
                command.message(`[Timestamps] debug mode: ${debug ? "on" : "off"}`)
                break;
            case 'on':
                command.message(`[Timestamps] ${enabled ? "module is already enabled" : "module enabled"}`)
                enabled = true;
                break;
            case 'off':
                command.message(`[Timestamps] ${enabled ? "module disabled" : "module is already disabled"}`)
                enabled = false;
                break;
            default:
                enabled = !enabled;
                command.message(`[Timestamps] module ${enabled ? "enabled" : "disabled"}`)
                break;
        }
    })

    dispatch.hook('S_ADD_BLOCKED_USER', 1, block)
    dispatch.hook('S_USER_BLOCK_LIST', 1, (event) => {
        event.blockList.forEach(block)
    })
    dispatch.hook('C_REMOVE_BLOCKED_USER', 1, (event) => {
        blocked.delete(event.name)
    })
    dispatch.hook('S_LOGIN', 10, (event) => {
        blocked.clear()
    })
    function block(user){
        blocked.add(user.name)
    }
    function processChatEvent(event) {
        if (enabled) {
            if(event.channel === 26) return
            if(blocked.has(event.authorName)) return false
            var time = new Date();
            var tt = time.toLocaleDateString('en-US', {hour: '2-digit', minute: 'numeric', hour12: true}).slice(-2).trim();
            var hh = time.getHours();
            var mm = time.getMinutes(); 
            hh = hh % 12;
            hh = hh ? '0' + hh : 12;
            mm = mm < 10 ? '0' + mm : mm;
            var timeStr = `${tt} ${hh}:${mm}`;
            event.authorName = `</a>${timeStr}][<a href='asfunction:chatNameAction,${event.authorName}@0@0'>${event.authorName}</a>`;
            if (debug) console.log(event);
        }
        return true
    }
    function processLfgEvent(event) {
        if (enabled) {
            if(event.channel === 26) return
            if(blocked.has(event.authorName)) return false
            var time = new Date();
            var tt = time.toLocaleDateString('en-US', {hour: '2-digit', minute: 'numeric', hour12: true}).slice(-2).trim();
            var hh = time.getHours();
            var minutes = time.getMinutes(); 
            hh = hh % 12;
            hh = hh ? '0' + hh : 12;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var timeStr = `${tt} ${hh}:${minutes}`;
            event.name = `</a>${timeStr}][<a href='asfunction:chatNameAction,${event.name}@0@0'>${event.name}</a>`
            if (debug) console.log(event);
        }
        return true
    }
    dispatch.hook('S_CHAT', 1, processChatEvent)
    dispatch.hook('S_PRIVATE_CHAT', 1, processChatEvent)
    dispatch.hook('S_PARTY_MATCH_LINK', 2, processLfgEvent)
}
