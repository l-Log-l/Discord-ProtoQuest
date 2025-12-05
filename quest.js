/*
 ██████╗ ██████╗  ██████╗ ████████╗ ██████╗  ██████╗ ██╗   ██╗███████╗███████╗████████╗
 ██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔═══██╗██╔═══██╗██║   ██║██╔════╝██╔════╝╚══██╔══╝
 ██████╔╝██████╔╝██║   ██║   ██║   ██║   ██║██║   ██║██║   ██║█████╗  ███████╗   ██║   
 ██╔═══╝ ██╔══██╗██║   ██║   ██║   ██║   ██║██║▄▄ ██║██║   ██║██╔══╝  ╚════██║   ██║   
 ██║     ██║  ██║╚██████╔╝   ██║   ╚██████╔╝╚██████╔╝╚██████╔╝███████╗███████║   ██║   
 ╚═╝     ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝  ╚══▀▀═╝  ╚═════╝ ╚══════╝╚══════╝   ╚═╝   
                                                                                       
                        Discord Quest Auto-Completer v2.0
*/

delete window.$;
let wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, r => r]);
webpackChunkdiscord_app.pop();

let ApplicationStreamingStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getStreamerActiveStreamMetadata).exports.Z;
let RunningGameStore = Object.values(wpRequire.c).find(x => x?.exports?.ZP?.getRunningGames).exports.ZP;
let QuestsStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getQuest).exports.Z;
let ChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getAllThreadsForParent).exports.Z;
let GuildChannelStore = Object.values(wpRequire.c).find(x => x?.exports?.ZP?.getSFWDefaultChannel).exports.ZP;
let FluxDispatcher = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.flushWaitQueue).exports.Z;
let api = Object.values(wpRequire.c).find(x => x?.exports?.tn?.get).exports.tn;
let LocaleStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getLocale).exports.Z;

let isApp = typeof DiscordNative !== "undefined";
let timerInterval = null;
let lastProgress = 0;
let lastUpdateTime = Date.now();
let isRunning = false;
let waitingMode = true;
let checkInterval = null;

// Language detection and translations
const translations = {
	en: {
		title: "PROTOQUEST - Discord Quest Completer",
		quest: "Quest",
		progress: "Progress",
		remaining: "Remaining",
		completed: "Quest completed!",
		noQuests: "No uncompleted quests found!",
		waitingMode: "Waiting mode - checking for new quests...",
		waitingForQuests: "Waiting for quests to appear...",
		nextCheck: "Next check in",
		seconds: "sec",
		minutes: "min",
		hours: "h",
		playingVideo: "Playing video for",
		gameActivated: "Game activated. Waiting for completion...",
		streamActivated: "Stream activated. Waiting for completion...",
		executingQuest: "Executing quest",
		browserError: "This no longer works in browser for non-video quests. Use the Discord desktop app to complete the",
		questWord: "quest",
		queueStatus: "Queue",
		processing: "Processing",
		pending: "Pending",
		foundNewQuest: "Found new quest",
		startingQuest: "Starting quest",
		allQuestsCompleted: "All quests completed!",
		enteringWaitMode: "Entering wait mode..."
	},
	ru: {
		title: "PROTOQUEST - Авто-выполнение квестов Discord",
		quest: "Задание",
		progress: "Прогресс",
		remaining: "Осталось",
		completed: "Задание выполнено!",
		noQuests: "Нет невыполненных заданий!",
		waitingMode: "Режим ожидания - проверка новых заданий...",
		waitingForQuests: "Ожидание появления заданий...",
		nextCheck: "Следующая проверка через",
		seconds: "сек",
		minutes: "м",
		hours: "ч",
		playingVideo: "Воспроизведение видео для",
		gameActivated: "Игра активирована. Ожидание завершения...",
		streamActivated: "Трансляция активирована. Ожидание завершения...",
		executingQuest: "Выполнение задания",
		browserError: "Это больше не работает в браузере для не-видео квестов. Используйте десктопное приложение Discord для выполнения квеста",
		questWord: "",
		queueStatus: "Очередь",
		processing: "Выполняется",
		pending: "Ожидает",
		foundNewQuest: "Найдено новое задание",
		startingQuest: "Начинаем задание",
		allQuestsCompleted: "Все задания выполнены!",
		enteringWaitMode: "Переход в режим ожидания..."
	}
};

function getClientLanguage() {
	try {
		const locale = LocaleStore.getLocale();
		return locale && locale.startsWith('ru') ? 'ru' : 'en';
	} catch {
		return 'en';
	}
}

let currentLang = getClientLanguage();
let t = translations[currentLang];

function formatTime(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;
	if (hours > 0) {
		return `${hours}${t.hours} ${minutes}${t.minutes} ${secs}${t.seconds}`;
	}
	return `${minutes}${t.minutes} ${secs}${t.seconds}`;
}

function createProgressBar(current, total) {
	const barLength = 30;
	const filledLength = Math.round((current / total) * barLength);
	const emptyLength = barLength - filledLength;
	
	const filled = '█'.repeat(filledLength);
	const empty = '░'.repeat(emptyLength);
	
	return `[${filled}${empty}]`;
}

const ASCII_LOGO = `
 ██████╗ ██████╗  ██████╗ ████████╗ ██████╗  ██████╗ ██╗   ██╗███████╗███████╗████████╗
 ██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔═══██╗██╔═══██╗██║   ██║██╔════╝██╔════╝╚══██╔══╝
 ██████╔╝██████╔╝██║   ██║   ██║   ██║   ██║██║   ██║██║   ██║█████╗  ███████╗   ██║   
 ██╔═══╝ ██╔══██╗██║   ██║   ██║   ██║   ██║██║▄▄ ██║██║   ██║██╔══╝  ╚════██║   ██║   
 ██║     ██║  ██║╚██████╔╝   ██║   ╚██████╔╝╚██████╔╝╚██████╔╝███████╗███████║   ██║   
 ╚═╝     ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝  ╚══▀▀═╝  ╚═════╝ ╚══════╝╚══════╝   ╚═╝   
`;

function displayLogo() {
	console.log(`%c${ASCII_LOGO}`, 'color: #5865F2; font-weight: bold;');
	console.log(`%c                        ${t.title}`, 'color: #5865F2; font-size: 12px;');
	console.log('');
}

function getAvailableQuests() {
	return [...QuestsStore.quests.values()].filter(x => 
		x.id !== "1412491570820812933" && 
		x.userStatus?.enrolledAt && 
		!x.userStatus?.completedAt && 
		new Date(x.config.expiresAt).getTime() > Date.now()
	);
}

function displayQueueStatus(quests, currentIndex) {
	console.clear();
	displayLogo();
	
	console.log(`╔════════════════════════════════════════════════════════════════╗`);
	console.log(`║  📋 ${t.queueStatus}: ${quests.length} ${t.quest.toLowerCase()}(s)                                    `);
	console.log(`╠════════════════════════════════════════════════════════════════╣`);
	
	quests.forEach((quest, index) => {
		const questName = quest.config.messages.questName;
		const status = index < currentIndex ? '✅' : (index === currentIndex ? '🔄' : '⏳');
		const statusText = index < currentIndex ? t.completed : (index === currentIndex ? t.processing : t.pending);
		console.log(`║  ${status} ${index + 1}. ${questName.substring(0, 40).padEnd(40)} [${statusText}]`);
	});
	
	console.log(`╚════════════════════════════════════════════════════════════════╝`);
	console.log('');
}

function displayProgress(questName, progress, total, isWaiting = false) {
	const percentage = Math.floor((progress / total) * 100);
	const remainingSeconds = Math.max(0, total - progress);
	const progressBar = createProgressBar(Math.min(progress, total), total);
	
	console.clear();
	displayLogo();
	
	if (isWaiting) {
		console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    ⏳ ${t.waitingMode}                         
╚════════════════════════════════════════════════════════════════╝

   ${t.waitingForQuests}
   ${t.nextCheck}: 30 ${t.seconds}
		`);
	} else {
		console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    📋 ${t.quest.toUpperCase()}                                      
╚════════════════════════════════════════════════════════════════╝

📌 ${t.quest}: ${questName}

${progressBar} ${percentage}%

⏱️  ${t.progress}: ${Math.min(progress, total)}/${total} ${t.seconds}
⏰ ${t.remaining}: ${formatTime(remainingSeconds)}
		`);
	}
}

function displayCompleted(questName, total) {
	console.clear();
	displayLogo();
	
	console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    📋 ${t.quest.toUpperCase()}                                      
╚════════════════════════════════════════════════════════════════╝

📌 ${t.quest}: ${questName}

[██████████████████████████████] 100%

⏱️  ${t.progress}: ${total}/${total} ${t.seconds}
✅ ${t.completed}
	`);
}

function displayWaitingMode(nextCheckIn) {
	console.clear();
	displayLogo();
	
	console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    ⏳ ${t.waitingMode}                         
╚════════════════════════════════════════════════════════════════╝

   ${t.waitingForQuests}
   ${t.nextCheck}: ${nextCheckIn} ${t.seconds}
	`);
}

function startRealTimeTimer(secondsNeeded, questName) {
	if (timerInterval) clearInterval(timerInterval);
	
	timerInterval = setInterval(() => {
		const elapsedSinceUpdate = Math.floor((Date.now() - lastUpdateTime) / 1000);
		const estimatedProgress = lastProgress + elapsedSinceUpdate;
		displayProgress(questName, Math.min(estimatedProgress, secondsNeeded), secondsNeeded);
	}, 1000);
}

function updateProgress(progress, secondsNeeded, questName) {
	lastProgress = progress;
	lastUpdateTime = Date.now();
	startRealTimeTimer(secondsNeeded, questName);
}

async function executeQuest(quest) {
	return new Promise(async (resolve) => {
		const pid = Math.floor(Math.random() * 30000) + 1000;
		
		const applicationId = quest.config.application.id;
		const applicationName = quest.config.application.name;
		const questName = quest.config.messages.questName;
		const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
		const taskName = ["WATCH_VIDEO", "PLAY_ON_DESKTOP", "STREAM_ON_DESKTOP", "PLAY_ACTIVITY", "WATCH_VIDEO_ON_MOBILE"].find(x => taskConfig.tasks[x] != null);
		const secondsNeeded = taskConfig.tasks[taskName].target;
		let secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

		if (taskName === "WATCH_VIDEO" || taskName === "WATCH_VIDEO_ON_MOBILE") {
			const maxFuture = 10, speed = 7, interval = 1;
			const enrolledAt = new Date(quest.userStatus.enrolledAt).getTime();
			let completed = false;
			
			console.log(`▶️  ${t.playingVideo} ${questName}...`);
			updateProgress(secondsDone, secondsNeeded, questName);
			
			while (true) {
				const maxAllowed = Math.floor((Date.now() - enrolledAt) / 1000) + maxFuture;
				const diff = maxAllowed - secondsDone;
				const timestamp = secondsDone + speed;
				if (diff >= speed) {
					const res = await api.post({url: `/quests/${quest.id}/video-progress`, body: {timestamp: Math.min(secondsNeeded, timestamp + Math.random())}});
					completed = res.body.completed_at != null;
					secondsDone = Math.min(secondsNeeded, timestamp);
					
					updateProgress(secondsDone, secondsNeeded, questName);
				}
				
				if (timestamp >= secondsNeeded) {
					break;
				}
				await new Promise(r => setTimeout(r, interval * 1000));
			}
			if (!completed) {
				await api.post({url: `/quests/${quest.id}/video-progress`, body: {timestamp: secondsNeeded}});
			}
			if (timerInterval) clearInterval(timerInterval);
			displayCompleted(questName, secondsNeeded);
			resolve();
			
		} else if (taskName === "PLAY_ON_DESKTOP") {
			if (!isApp) {
				console.log(`❌ ${t.browserError} ${questName} ${t.questWord}!`);
				resolve();
				return;
			}
			
			const res = await api.get({url: `/applications/public?application_ids=${applicationId}`});
			const appData = res.body[0];
			const exeName = appData.executables.find(x => x.os === "win32").name.replace(">", "");
			
			const fakeGame = {
				cmdLine: `C:\\Program Files\\${appData.name}\\${exeName}`,
				exeName,
				exePath: `c:/program files/${appData.name.toLowerCase()}/${exeName}`,
				hidden: false,
				isLauncher: false,
				id: applicationId,
				name: appData.name,
				pid: pid,
				pidPath: [pid],
				processName: appData.name,
				start: Date.now(),
			};
			const realGames = RunningGameStore.getRunningGames();
			const fakeGames = [fakeGame];
			const realGetRunningGames = RunningGameStore.getRunningGames;
			const realGetGameForPID = RunningGameStore.getGameForPID;
			RunningGameStore.getRunningGames = () => fakeGames;
			RunningGameStore.getGameForPID = (pid) => fakeGames.find(x => x.pid === pid);
			FluxDispatcher.dispatch({type: "RUNNING_GAMES_CHANGE", removed: realGames, added: [fakeGame], games: fakeGames});
			
			console.log(`🎮 ${applicationName} ${t.gameActivated}`);
			updateProgress(secondsDone, secondsNeeded, questName);
			
			let fn = data => {
				let progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.PLAY_ON_DESKTOP.value);
				updateProgress(progress, secondsNeeded, questName);
				
				if (progress >= secondsNeeded) {
					if (timerInterval) clearInterval(timerInterval);
					displayCompleted(questName, secondsNeeded);
					
					RunningGameStore.getRunningGames = realGetRunningGames;
					RunningGameStore.getGameForPID = realGetGameForPID;
					FluxDispatcher.dispatch({type: "RUNNING_GAMES_CHANGE", removed: [fakeGame], added: [], games: []});
					FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
					resolve();
				}
			};
			FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
			
		} else if (taskName === "STREAM_ON_DESKTOP") {
			if (!isApp) {
				console.log(`❌ ${t.browserError} ${questName} ${t.questWord}!`);
				resolve();
				return;
			}
			
			let realFunc = ApplicationStreamingStore.getStreamerActiveStreamMetadata;
			ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => ({
				id: applicationId,
				pid,
				sourceName: null
			});
			
			console.log(`📡 ${applicationName} ${t.streamActivated}`);
			updateProgress(secondsDone, secondsNeeded, questName);
			
			let fn = data => {
				let progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.STREAM_ON_DESKTOP.value);
				updateProgress(progress, secondsNeeded, questName);
				
				if (progress >= secondsNeeded) {
					if (timerInterval) clearInterval(timerInterval);
					displayCompleted(questName, secondsNeeded);
					
					ApplicationStreamingStore.getStreamerActiveStreamMetadata = realFunc;
					FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
					resolve();
				}
			};
			FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
			
		} else if (taskName === "PLAY_ACTIVITY") {
			const channelId = ChannelStore.getSortedPrivateChannels()[0]?.id ?? Object.values(GuildChannelStore.getAllGuilds()).find(x => x != null && x.VOCAL.length > 0).VOCAL[0].channel.id;
			const streamKey = `call:${channelId}:1`;
			
			console.log(`▶️  ${t.executingQuest} ${questName}...`);
			updateProgress(secondsDone, secondsNeeded, questName);
			
			while (true) {
				const res = await api.post({url: `/quests/${quest.id}/heartbeat`, body: {stream_key: streamKey, terminal: false}});
				const progress = res.body.progress.PLAY_ACTIVITY.value;
				updateProgress(progress, secondsNeeded, questName);
				
				await new Promise(r => setTimeout(r, 20 * 1000));
				
				if (progress >= secondsNeeded) {
					await api.post({url: `/quests/${quest.id}/heartbeat`, body: {stream_key: streamKey, terminal: true}});
					break;
				}
			}
			
			if (timerInterval) clearInterval(timerInterval);
			displayCompleted(questName, secondsNeeded);
			resolve();
		} else {
			resolve();
		}
	});
}

async function processQuestQueue() {
	if (isRunning) return;
	isRunning = true;
	
	let quests = getAvailableQuests();
	
	if (quests.length === 0) {
		if (waitingMode) {
			startWaitingMode();
		} else {
			console.clear();
			displayLogo();
			console.log(`❌ ${t.noQuests}`);
		}
		isRunning = false;
		return;
	}
	
	// Stop waiting mode if it was active
	if (checkInterval) {
		clearInterval(checkInterval);
		checkInterval = null;
	}
	
	displayQueueStatus(quests, 0);
	await new Promise(r => setTimeout(r, 2000));
	
	for (let i = 0; i < quests.length; i++) {
		const quest = quests[i];
		console.log(`\n🚀 ${t.startingQuest}: ${quest.config.messages.questName}`);
		await new Promise(r => setTimeout(r, 1000));
		
		await executeQuest(quest);
		
		// Refresh quest list after each completion
		quests = getAvailableQuests();
		
		if (i < quests.length - 1) {
			displayQueueStatus(quests, i + 1);
			await new Promise(r => setTimeout(r, 2000));
		}
	}
	
	console.log(`\n✅ ${t.allQuestsCompleted}`);
	
	if (waitingMode) {
		console.log(`\n⏳ ${t.enteringWaitMode}`);
		await new Promise(r => setTimeout(r, 3000));
		startWaitingMode();
	}
	
	isRunning = false;
}

function startWaitingMode() {
	if (checkInterval) {
		clearInterval(checkInterval);
	}
	
	let countdown = 30;
	displayWaitingMode(countdown);
	
	const countdownInterval = setInterval(() => {
		countdown--;
		if (countdown > 0) {
			displayWaitingMode(countdown);
		}
	}, 1000);
	
	checkInterval = setInterval(() => {
		clearInterval(countdownInterval);
		
		const quests = getAvailableQuests();
		if (quests.length > 0) {
			clearInterval(checkInterval);
			checkInterval = null;
			console.log(`\n🎉 ${t.foundNewQuest}: ${quests[0].config.messages.questName}`);
			processQuestQueue();
		} else {
			countdown = 30;
			displayWaitingMode(countdown);
			
			const newCountdownInterval = setInterval(() => {
				countdown--;
				if (countdown > 0) {
					displayWaitingMode(countdown);
				} else {
					clearInterval(newCountdownInterval);
				}
			}, 1000);
		}
	}, 30000);
}

// Initialize
console.clear();
displayLogo();
console.log(`\n🌐 Language: ${currentLang === 'ru' ? 'Русский' : 'English'}`);
console.log(`💻 Platform: ${isApp ? 'Desktop App' : 'Browser'}`);
console.log(`\n🚀 Starting ProtoQuest...`);

setTimeout(() => {
	processQuestQueue();
}, 1500);