import pkgDiscord from 'discord.js-selfbot-v13-siuuu';
const { Client } = pkgDiscord;
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    StreamType
} from '@discordjs/voice';
import pkgPrism from 'prism-media';
const { FFmpeg } = pkgPrism;
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { SecretsManager } from "@bytehide/secrets";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dns from 'dns';
import https from 'https';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VERSION = "2.1.0";
const UPDATE_URL = "https://raw.githubusercontent.com/anasba455-spec/KEY-SYS/refs/heads/main/version.json";

SecretsManager.unsecureInitialize("bh_cTLnhgTZiQxHtal1flxQcrj6CxqV8M1GLA", "production");

const Colors = {
    RESET: "\x1b[0m",
    BOLD: "\x1b[1m",
    DIM: "\x1b[2m",
    RED: "\x1b[38;5;196m",
    DARK_RED: "\x1b[38;5;88m",
    WHITE: "\x1b[38;5;231m",
    GRAY: "\x1b[38;5;244m",
    CYAN: "\x1b[38;5;51m",
    GOLD: "\x1b[38;5;220m",
    GREEN: "\x1b[38;5;46m",
    BLUE: "\x1b[38;5;33m",
    PURPLE: "\x1b[38;5;129m",
    ORANGE: "\x1b[38;5;208m",
    PINK: "\x1b[38;5;213m",
    BLINK: "\x1b[5m"
};

const ASCII_ART = `
    ${Colors.RED}█████╗ ███╗   ██╗ █████╗ ███████╗     ██████╗ ███████╗ █████╗ ██████╗ ███████╗██████╗ 
    ${Colors.RED}██╔══██╗████╗  ██║██╔══██╗██╔════╝     ██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗
    ${Colors.WHITE}███████║██╔██╗ ██║███████║███████╗     ██████╔╝█████╗  ███████║██████╔╝█████╗  ██████╔╝
    ${Colors.WHITE}██╔══██║██║╚██╗██║██╔══██║╚════██║     ██╔══██╗██╔══╝  ██╔══██║██╔═══╝ ██╔══╝  ██╔══██╗
    ${Colors.GRAY}██║  ██║██║ ╚████║██║  ██║███████║     ██║  ██║███████╗██║  ██║██║     ███████╗██║  ██║
    ${Colors.GRAY}╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝
`;

const SCRIPT_DIR = process.pkg ? path.dirname(process.execPath) : __dirname;
const AUDIO_FILE = path.join(SCRIPT_DIR, 'theri.mp4');
const AUDIO_FILE_2 = path.join(SCRIPT_DIR, 'theri_2.mp3');
const AUDIO_FILE_3 = path.join(SCRIPT_DIR, 'sheep.mp3');
const AUDIO_FILE_NEW = path.join(SCRIPT_DIR, 'theri_new.mp3');
const TOKEN_FILE = path.join(SCRIPT_DIR, 'token.txt');
const LOG_FILE = path.join(SCRIPT_DIR, 'bot_error.log');
const FFMPEG_PATH = path.join(SCRIPT_DIR, 'ffmpeg.exe');

process.env.FFMPEG_PATH = FFMPEG_PATH;

function logToFile(message) {
    const timestamp = new Date().toISOString();
    try { fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`); } catch (e) { }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));
const bots = [];
let isMuted = false;
let isGhostQuitted = false;
let currentAudio = AUDIO_FILE;
let theriOffset = 0;
let lastStartTime = 0;
let chatSyncInterval = null;
let chatSyncChannelId = "";
let chatSyncMessage = "";

let botStatusData = [];
let totalBots = 0;
let animFrame = 0;
const spinner = ["|", "/", "-", "\\"];
let isNetworkDown = false;

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => {
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

async function checkForUpdates() {
    process.stdout.write(`    ${Colors.RED}> ${Colors.WHITE}Checking for updates... `);
    try {
        const remoteData = await fetchJSON(UPDATE_URL);
        if (remoteData.version !== VERSION) {
            process.stdout.write(`\n    ${Colors.GOLD}${Colors.BOLD}[!] New Version Available: ${remoteData.version}${Colors.RESET}\n`);
            process.stdout.write(`    ${Colors.WHITE}Anas v2 updating pls wait...${Colors.RESET}\n`);

            const downloadUrl = process.pkg ? remoteData.exeUrl : remoteData.jsUrl;
            const targetPath = process.pkg ? process.execPath : __filename;

            if (downloadUrl) {
                await downloadFile(downloadUrl, targetPath + ".new");
                process.stdout.write(`    ${Colors.GREEN}[+] Update downloaded.${Colors.RESET}\n`);
                if (process.pkg) {
                    fs.writeFileSync(path.join(SCRIPT_DIR, 'update.bat'),
                        `@echo off\ntimeout /t 2 /nobreak > nul\nmove /y "${targetPath}.new" "${targetPath}"\nstart "" "${targetPath}"\nexit`);
                    process.stdout.write(`    ${Colors.ORANGE}[!] Run update.bat to complete update.${Colors.RESET}\n`);
                } else {
                    fs.renameSync(targetPath + ".new", targetPath);
                    process.stdout.write(`    ${Colors.GREEN}[+] Script updated. Restarting...${Colors.RESET}\n`);
                    process.exit(0);
                }
                await delay(3000);
            }
        } else {
            process.stdout.write(`${Colors.GREEN}Up to date.${Colors.RESET}\n`);
        }
    } catch (e) {
        process.stdout.write(`${Colors.GRAY}Skipped (Check failed)${Colors.RESET}\n`);
    }
}

function handleNetworkLost() {
    bots.forEach(bot => {
        if (bot.player) bot.player.pause();
        bot.status = "Network Lost";
        botStatusData[bot.index].status = "Network Lost";
    });
    if (currentAudio === AUDIO_FILE) {
        theriOffset += (Date.now() - lastStartTime);
    }
    renderDeploymentStatus();
}

async function handleNetworkRestored() {
    for (const bot of bots) {
        bot.status = "Reconnecting...";
        botStatusData[bot.index].status = "Reconnecting...";
        renderDeploymentStatus();
        try {
            await joinVC(bot);
            bot.status = "Ready";
            botStatusData[bot.index].status = "Ready";
            if (!isMuted && !bot.isIndividuallyMuted) {
                startAudio(bot);
            }
        } catch (e) {
            bot.status = "Recon. Failed";
            botStatusData[bot.index].status = "Recon. Failed";
        }
    }
    renderDeploymentStatus();
}

async function monitorNetwork() {
    while (true) {
        try {
            await lookup('google.com');
            if (isNetworkDown) {
                isNetworkDown = false;
                logToFile("Network restored. Reconnecting bots...");
                await handleNetworkRestored();
            }
        } catch (err) {
            if (!isNetworkDown) {
                isNetworkDown = true;
                logToFile("Network disconnected. Pausing bots...");
                handleNetworkLost();
            }
        }
        await delay(5000);
    }
}

async function showBanner() {
    console.clear();
    process.stdout.write(ASCII_ART + '\n');
    process.stdout.write(`    ${Colors.RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    process.stdout.write(`    ${Colors.WHITE}${Colors.BOLD}                             ANAS VOICE REAPER V2.0\n`);
    process.stdout.write(`    ${Colors.RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${Colors.RESET}\n\n`);
}

async function checkKey() {
    await showBanner();
    process.stdout.write(`    ${Colors.RED}> ${Colors.WHITE}System Authentication... `);

    try {
        const validKey = await SecretsManager.get("KEY");
        const userKey = await question(`\n    ${Colors.RED}> ${Colors.WHITE}Enter License Key: ${Colors.RESET}`);

        if (userKey && userKey.trim() === validKey) {
            process.stdout.write(`    ${Colors.GREEN}${Colors.BOLD}[+] Access Granted. Anas v2 Ready.${Colors.RESET}\n`);
            await delay(1000);
            return true;
        } else {
            process.stdout.write(`    ${Colors.RED}${Colors.BOLD}[X] Access Denied Poda Myre.${Colors.RESET}\n`);
            await delay(3000);
            process.exit(1);
        }
    } catch (err) {
        process.stdout.write(`    ${Colors.RED}[X] Authentication Failed: ${err.message}${Colors.RESET}\n`);
        process.exit(1);
    }
}

function loadTokens() {
    if (!fs.existsSync(TOKEN_FILE)) {
        process.stdout.write(`    ${Colors.RED}[X] Error: token.txt not found!${Colors.RESET}\n`);
        process.exit(1);
    }
    const tokens = fs.readFileSync(TOKEN_FILE, 'utf8').split('\n').map(t => t.trim()).filter(t => t.length > 0).slice(0, 10);
    if (tokens.length === 0) {
        process.stdout.write(`    ${Colors.RED}[X] Error: No tokens found!${Colors.RESET}\n`);
        process.exit(1);
    }
    return tokens;
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function renderDeploymentStatus() {
    process.stdout.write(`\x1b[${totalBots}A`);

    for (let i = 0; i < totalBots; i++) {
        const data = botStatusData[i];
        let icon, statusColor;

        if (data.status === "Ready") {
            icon = `${Colors.GREEN}[+]${Colors.RESET}`;
            statusColor = Colors.GREEN;
        } else if (data.status === "Network Lost") {
            icon = `${Colors.RED}[!]${Colors.RESET}`;
            statusColor = Colors.RED;
        } else if (data.status.includes("Failed") || data.status.includes("Error") || data.status.includes("Timed")) {
            icon = `${Colors.RED}[X]${Colors.RESET}`;
            statusColor = Colors.RED;
        } else {
            icon = `${Colors.CYAN}[${spinner[animFrame]}]${Colors.RESET}`;
            statusColor = Colors.CYAN;
        }

        const name = data.username.substring(0, 22).padEnd(22);
        const status = data.status.padEnd(18);

        process.stdout.write(`\x1b[2K\r    ${icon} ${Colors.WHITE}${Colors.BOLD}${name}${Colors.RESET} ${Colors.GRAY}>>${Colors.RESET} ${statusColor}${status}${Colors.RESET}\n`);
    }

    animFrame = (animFrame + 1) % spinner.length;
}

async function setupBot(token, guildId, channelId, index) {
    const client = new Client({ checkUpdate: false });
    const bot = {
        client,
        username: `Token ${index + 1}`,
        connection: null,
        player: null,
        targetChannelId: channelId,
        targetGuildId: guildId,
        isPlaying: false,
        isIndividuallyMuted: false,
        index: index,
        status: "Connecting..."
    };

    botStatusData[index] = { username: bot.username, status: bot.status };

    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            if (botStatusData[index].status !== "Ready") {
                botStatusData[index].status = "Timed out";
            }
            resolve(false);
        }, 45000);

        client.on('ready', async () => {
            bot.username = client.user.username;
            botStatusData[index].username = bot.username;
            botStatusData[index].status = "Joining VC...";

            bots.push(bot);

            let joined = false;
            for (let attempt = 0; attempt < 3 && !joined; attempt++) {
                try {
                    await joinVC(bot);
                    joined = true;
                    botStatusData[index].status = "Ready";
                } catch (e) {
                    logToFile(`${bot.username}: Join attempt ${attempt + 1} failed: ${e.message}`);
                    if (attempt < 2) await delay(1000);
                }
            }

            if (!joined) {
                if (bot.connection) {
                    botStatusData[index].status = "Ready";
                } else {
                    botStatusData[index].status = "Join Failed";
                }
            }

            clearTimeout(timeout);
            resolve(true);
        });

        client.on('error', (err) => {
            botStatusData[index].status = "Error";
            logToFile(`Bot ${index + 1} error: ${err.message}`);
        });

        client.login(token).catch(() => {
            botStatusData[index].status = "Login Failed";
            resolve(false);
        });
    });
}

async function joinVC(bot) {
    let guild = bot.client.guilds.cache.get(bot.targetGuildId);
    if (!guild) {
        try {
            guild = await bot.client.guilds.fetch(bot.targetGuildId);
        } catch (e) {
            logToFile(`${bot.username}: Guild fetch failed: ${e.message}`);
            throw new Error("Guild not found");
        }
    }

    const connection = joinVoiceChannel({
        channelId: bot.targetChannelId,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
        group: bot.client.user.id
    });

    bot.connection = connection;

    connection.on('error', (err) => {
        logToFile(`${bot.username}: Voice connection error: ${err.message}`);
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 15000);
    } catch (e) {
        logToFile(`${bot.username}: entersState timeout, but connection may still work`);
    }

    if (bot.isPlaying && bot.player) {
        connection.subscribe(bot.player);
    }

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        if (isGhostQuitted || isNetworkDown) return;
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5000),
            ]);
        } catch (error) {
            try {
                connection.destroy();
                await delay(2000);
                await joinVC(bot);
            } catch (e) {
                logToFile(`${bot.username}: Reconnection failed: ${e.message}`);
            }
        }
    });
}

function startAudio(bot) {
    if (!bot.connection) return;
    if (bot.player) { try { bot.player.stop(); } catch (e) { } }

    bot.isPlaying = true;
    const player = createAudioPlayer();
    bot.player = player;
    bot.connection.subscribe(player);

    const play = () => {
        if (!bot.isPlaying || isGhostQuitted || isNetworkDown) return;

        try {
            const pitchShift = 0.98 + (Math.random() * 0.04);

            // PERMANENT FILTER AS REQUESTED
            let filter = `volume=41dB,bass=g=61,highpass=f=100,lowpass=f=8000,compand=attacks=0:decays=0:points=-80/-80|-40/-20|0/0,atempo=${pitchShift},aloop=loop=-1:size=2e+09`;

            if (currentAudio === AUDIO_FILE_2 || currentAudio === AUDIO_FILE_NEW) {
                // theri_2 or new theri: No bass, highest volume
                filter = `volume=50dB,highpass=f=100,lowpass=f=8000,compand=attacks=0:decays=0:points=-80/-80|-40/-20|0/0,atempo=${pitchShift},aloop=loop=-1:size=2e+09`;
            }

            const args = [
                '-analyzeduration', '0',
                '-loglevel', '0',
                '-vn',
                '-f', 's16le',
                '-ar', '48000',
                '-ac', '2'
            ];

            if (currentAudio !== AUDIO_FILE_3) args.push('-af', filter);

            if (currentAudio === AUDIO_FILE) {
                const totalOffset = (theriOffset / 1000) + (Math.random() * 0.1);
                args.unshift('-ss', totalOffset.toString());
            }

            const ffmpeg = new FFmpeg({ args });
            const stream = fs.createReadStream(currentAudio).pipe(ffmpeg);

            stream.on('error', (err) => {
                logToFile(`${bot.username}: FFmpeg error: ${err.message}`);
                if (bot.isPlaying && !isNetworkDown) setTimeout(play, 1000);
            });

            const resource = createAudioResource(stream, {
                inputType: StreamType.Raw,
                inlineVolume: false
            });

            player.play(resource);
            if (currentAudio === AUDIO_FILE) lastStartTime = Date.now();
        } catch (e) {
            logToFile(`${bot.username}: Play error: ${e.message}`);
            if (bot.isPlaying && !isNetworkDown) setTimeout(play, 1000);
        }
    };

    player.on(AudioPlayerStatus.Idle, () => { if (bot.isPlaying && !isNetworkDown) play(); });
    player.on('error', (err) => {
        logToFile(`${bot.username}: Player error: ${err.message}`);
        if (bot.isPlaying && !isNetworkDown) setTimeout(play, 1000);
    });

    play();
    if (isMuted || bot.isIndividuallyMuted) player.pause();
}

async function handleMenu() {
    while (true) {
        await showBanner();

        console.log(`    ${Colors.RED}<<< ${Colors.GOLD}${Colors.BOLD}ANAS REAPER CONTROL PANEL${Colors.RED} >>>${Colors.RESET}`);
        console.log(`    ${Colors.RED}============================================${Colors.RESET}\n`);

        console.log(`    ${Colors.RED}1.${Colors.RESET} ${Colors.BOLD}${Colors.RED}Mute All Bots${Colors.RESET}`);
        console.log(`    ${Colors.RED}2.${Colors.RESET} ${Colors.BOLD}${Colors.GREEN}Unmute All Bots${Colors.RESET}`);
        console.log(`    ${Colors.RED}3.${Colors.RESET} ${Colors.BOLD}${Colors.CYAN}Switch Channel${Colors.RESET}`);
        console.log(`    ${Colors.RED}4.${Colors.RESET} ${Colors.BOLD}${Colors.ORANGE}Ghost Disconnect${Colors.RESET}`);
        console.log(`    ${Colors.RED}5.${Colors.RESET} ${Colors.BOLD}${Colors.BLUE}Ghost Reconnect${Colors.RESET}`);
        console.log(`    ${Colors.RED}6.${Colors.RESET} ${Colors.BOLD}${Colors.GOLD}Switch Theri${Colors.RESET}`);
        console.log(`    ${Colors.RED}7.${Colors.RESET} ${Colors.BOLD}${Colors.PURPLE}Update Nicknames${Colors.RESET}`);
        console.log(`    ${Colors.RED}8.${Colors.RESET} ${Colors.BOLD}${Colors.PINK}Chat Spammer${Colors.RESET}`);
        console.log(`    ${Colors.RED}9.${Colors.RESET} ${Colors.BOLD}${Colors.WHITE}Sheep --best for troll${Colors.RESET}`);
        console.log(`    ${Colors.RED}10.${Colors.RESET} ${Colors.BOLD}${Colors.CYAN}Individual Mute/Unmute${Colors.RESET}\n`);

        const choice = await question(`    ${Colors.RED}> ${Colors.WHITE}${Colors.BOLD}Select Command: ${Colors.RESET}`);
        if (choice.toLowerCase() === 'back') continue;

        switch (choice) {
            case '1': isMuted = true; bots.forEach(b => b.player?.pause()); break;
            case '2': isMuted = false; bots.forEach(b => { if (!b.isIndividuallyMuted) b.player?.unpause(); }); break;
            case '3':
                const newChannelId = await question(`\n    ${Colors.CYAN}> ${Colors.WHITE}Enter Target VC ID: ${Colors.RESET}`);
                if (newChannelId.toLowerCase() === 'back') break;
                await Promise.all(bots.map(async (bot) => { bot.targetChannelId = newChannelId; await joinVC(bot); }));
                break;
            case '4':
                isGhostQuitted = true;
                bots.forEach(b => { b.isPlaying = false; b.player?.stop(); b.connection?.destroy(); b.connection = null; });
                break;
            case '5':
                isGhostQuitted = false;
                await Promise.all(bots.map(bot => joinVC(bot)));
                break;
            case '6':
                if (currentAudio === AUDIO_FILE) {
                    if (lastStartTime > 0) theriOffset += (Date.now() - lastStartTime);
                    currentAudio = fs.existsSync(AUDIO_FILE_NEW) ? AUDIO_FILE_NEW : AUDIO_FILE_2;
                } else {
                    currentAudio = AUDIO_FILE;
                }
                console.log(`\n    ${Colors.GREEN}[!] Switching Theri...${Colors.RESET}`);
                bots.forEach(b => { startAudio(b); });
                await delay(1000);
                break;
            case '7':
                const newNick = await question(`\n    ${Colors.PURPLE}> ${Colors.WHITE}Enter New Nickname: ${Colors.RESET}`);
                if (newNick.toLowerCase() === 'back') break;
                await Promise.all(bots.map(async (bot) => { try { const guild = await bot.client.guilds.fetch(bot.targetGuildId); await guild.me.setNickname(newNick); } catch (e) { } }));
                break;
            case '8':
                chatSyncChannelId = await question(`\n    ${Colors.GOLD}> ${Colors.WHITE}Enter Channel ID: ${Colors.RESET}`);
                chatSyncMessage = await question(`\n    ${Colors.GOLD}> ${Colors.WHITE}Enter Message: ${Colors.RESET}`);
                const msgCount = await question(`\n    ${Colors.GOLD}> ${Colors.WHITE}Enter Message Count: ${Colors.RESET}`);
                const count = parseInt(msgCount) || 10;

                console.log(`\n    ${Colors.GREEN}[!] Starting Max Speed Spam...${Colors.RESET}`);
                for (let i = 0; i < count; i++) {
                    await Promise.all(bots.map(async (bot) => {
                        try {
                            const channel = await bot.client.channels.fetch(chatSyncChannelId);
                            if (channel) await channel.send(chatSyncMessage);
                        } catch (e) { }
                    }));
                    await delay(50); // Minimum delay to avoid instant rate limit but keep max speed
                }
                console.log(`\n    ${Colors.GREEN}[+] Spam Complete.${Colors.RESET}`);
                await delay(1000);
                break;
            case '9': currentAudio = AUDIO_FILE_3; bots.forEach(b => { startAudio(b); }); break;
            case '10':
                while (true) {
                    await showBanner();
                    console.log(`    ${Colors.RED}<<< ${Colors.CYAN}${Colors.BOLD}INDIVIDUAL MUTE CONTROL${Colors.RED} >>>${Colors.RESET}`);
                    console.log(`    ${Colors.RED}============================================${Colors.RESET}\n`);

                    bots.forEach((bot, i) => {
                        const status = bot.isIndividuallyMuted ? `${Colors.RED}(MUTED)${Colors.RESET}` : `${Colors.GREEN}(ACTIVE)${Colors.RESET}`;
                        console.log(`    ${Colors.RED}${i + 1}.${Colors.RESET} ${Colors.WHITE}${bot.username.padEnd(20)}${Colors.RESET} ${status}`);
                    });
                    console.log(`\n    ${Colors.RED}0.${Colors.RESET} ${Colors.WHITE}Back to Main Menu${Colors.RESET}\n`);

                    const botChoice = await question(`    ${Colors.RED}> ${Colors.WHITE}Select Bot to Toggle: ${Colors.RESET}`);
                    if (botChoice === '0' || botChoice.toLowerCase() === 'back') break;

                    const botIdx = parseInt(botChoice) - 1;
                    if (bots[botIdx]) {
                        bots[botIdx].isIndividuallyMuted = !bots[botIdx].isIndividuallyMuted;
                        if (bots[botIdx].isIndividuallyMuted) bots[botIdx].player?.pause();
                        else if (!isMuted) bots[botIdx].player?.unpause();
                    }
                }
                break;
        }
    }
}

async function main() {
    await checkForUpdates();
    if (!await checkKey()) return;
    await showBanner();
    const tokens = loadTokens();
    const mode = await question(`    ${Colors.CYAN}> ${Colors.WHITE}${Colors.BOLD}Enable Multi-Channel Mode? (y/n): ${Colors.RESET}`);
    const isDifferent = mode.toLowerCase() === 'y';
    const guildId = await question(`    ${Colors.CYAN}> ${Colors.WHITE}${Colors.BOLD}Target Server ID: ${Colors.RESET}`);
    const botConfigs = [];

    if (isDifferent) {
        for (let i = 0; i < tokens.length; i++) {
            const channelId = await question(`    ${Colors.CYAN}> ${Colors.WHITE}VC ID for Token ${i + 1}: ${Colors.RESET}`);
            botConfigs.push({ token: tokens[i], guildId, channelId });
        }
    } else {
        const channelId = await question(`    ${Colors.CYAN}> ${Colors.WHITE}Target Channel ID: ${Colors.RESET}`);
        tokens.forEach(t => botConfigs.push({ token: t, guildId, channelId }));
    }

    await showBanner();

    totalBots = botConfigs.length;
    botStatusData = new Array(totalBots);
    for (let i = 0; i < totalBots; i++) {
        botStatusData[i] = { username: `Token ${i + 1}`, status: "Waiting..." };
        process.stdout.write('\n');
    }

    const animInterval = setInterval(renderDeploymentStatus, 100);
    await Promise.all(botConfigs.map((config, i) => setupBot(config.token, config.guildId, config.channelId, i)));
    clearInterval(animInterval);
    renderDeploymentStatus();
    monitorNetwork();

    if (bots.length === 0) {
        console.log(`\n    ${Colors.RED}${Colors.BOLD}[X] Critical Error: Deployment Failed.${Colors.RESET}`);
        process.exit(1);
    }

    console.log(`\n\n    ${Colors.RED}${Colors.BOLD}>>> ENTER TO BLAST <<<${Colors.RESET}`);
    await question("");

    process.stdout.write(`\n    ${Colors.RED}${Colors.BOLD}`);
    const blastText = "*** BLASTING ANAS REAPER V2 ***";
    for (let i = 0; i < blastText.length; i++) {
        process.stdout.write(blastText[i]);
        await delay(30);
    }
    process.stdout.write(`${Colors.RESET}\n\n    ${Colors.CYAN}`);
    for (let i = 0; i <= 20; i++) {
        process.stdout.write(`\r    ${Colors.CYAN}[${'='.repeat(i)}${' '.repeat(20 - i)}] ${Math.floor(i * 5)}%${Colors.RESET}`);
        await delay(50);
    }
    console.log(`\r    ${Colors.GREEN}[====================] 100% READY!${Colors.RESET}\n`);

    for (const bot of bots) {
        startAudio(bot);
        await delay(150);
    }

    await delay(800);
    await handleMenu();
}

process.on('SIGINT', () => {
    bots.forEach(b => { try { b.connection?.destroy(); b.client?.destroy(); } catch (e) { } });
    process.exit(0);
});

main().catch(console.error);
