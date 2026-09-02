-- World War config for TFS 1.5 / protocol 8.60
-- Copy over config.lua in your TFS folder and set mysql + ip.

worldType = "pvp-enforced"
hotkeyAimbotEnabled = true
protectionLevel = 1
killsToRedSkull = 100
killsToBlackSkull = 200
pzLocked = 15000
removeChargesFromRunes = false
removeChargesFromPotions = false
removeWeaponAmmunition = false
removeWeaponCharges = false
timeToDecreaseFrags = 24 * 60 * 60
whiteSkullTime = 15 * 60
stairJumpExhaustion = 1000
experienceByKillingPlayers = false
expFromPlayersLevelRange = 75
pzLockSkullAttacker = false

-- Connection
-- onePlayerOnlinePerAccount = false  -> many people on account 1 at once
-- allowClones = false                 -> a taken character cannot be entered twice
-- replaceKickOnLogin = false           -> second login does NOT steal the character
ip = "127.0.0.1"
bindOnlyGlobalAddress = false
loginProtocolPort = 7171
gameProtocolPort = 7172
statusProtocolPort = 7171
maxPlayers = 0
motd = "World War: Antica vs Amera. Account 1 / 1. Pick a free name."
onePlayerOnlinePerAccount = false
allowClones = false
allowWalkthrough = true
serverName = "World War"
statusTimeout = 5000
replaceKickOnLogin = false
maxPacketsPerSecond = 50
showOnlineStatusInCharlist = true

deathLosePercent = 0

housePriceEachSQM = -1
houseRentPeriod = "never"
houseOwnedByAccount = false
houseDoorShowPrice = false
onlyInvitedCanMoveHouseItems = true

timeBetweenActions = 200
timeBetweenExActions = 1000

mapName = "war"
mapAuthor = "your map"

marketOfferDuration = 30 * 24 * 60 * 60
premiumToCreateMarketOffer = false
checkExpiredMarketOffersEachMinutes = 60
maxMarketOffersAtATimePerPlayer = 100

mysqlHost = "127.0.0.1"
mysqlUser = "tfs"
mysqlPass = "war"
mysqlDatabase = "tfs"
mysqlPort = 3307
mysqlSock = ""

allowChangeOutfit = true
freePremium = true
kickIdlePlayerAfterMinutes = 15
maxMessageBuffer = 4
emoteSpells = true
classicEquipmentSlots = true
classicAttackSpeed = true
showScriptsLogInConsole = false
yellMinimumLevel = 1
yellAlwaysAllowPremium = true
minimumLevelToSendPrivate = 1
premiumToSendPrivate = false
forceMonsterTypesOnLoad = true
cleanProtectionZones = false
luaItemDesc = false
showPlayerLogInConsole = true

vipFreeLimit = 20
vipPremiumLimit = 100
depotFreeLimit = 2000
depotPremiumLimit = 10000

defaultWorldLight = true

serverSaveNotifyMessage = true
serverSaveNotifyDuration = 5
serverSaveCleanMap = false
serverSaveClose = false
serverSaveShutdown = false

experienceStages = {
	{ minlevel = 1, multiplier = 1 }
}

rateExp = 1
rateSkill = 1
rateLoot = 1
rateMagic = 3
rateSpawn = 1

deSpawnRange = 2
deSpawnRadius = 50
removeOnDespawn = true
walkToSpawnRadius = 15

staminaSystem = false

warnUnsafeScripts = true
convertUnsafeScripts = true

defaultPriority = "high"
startupDatabaseOptimization = false

ownerName = ""
ownerEmail = ""
url = "https://otland.net/"
location = "War"
