-- World War overlay for The Forgotten Server 1.5 (protocol 8.60)
-- Copy this file into your datapack: data/scripts/world_war.lua
-- Edit the spawn coordinates to match YOUR map temples.

local WAR = {
	spawns = {
		antica = Position(100, 115, 7),
		amera = Position(200, 115, 7)
	},
	-- vocation id => kit. Item ids are 8.60 vanilla TFS.
	kit = {
		[8] = { -- Elite Knight
			{2493, CONST_SLOT_HEAD},
			{2173, CONST_SLOT_NECKLACE},
			{1988, CONST_SLOT_BACKPACK},
			{2472, CONST_SLOT_ARMOR},
			{2400, CONST_SLOT_RIGHT},
			{2520, CONST_SLOT_LEFT},
			{2495, CONST_SLOT_LEGS},
			{2645, CONST_SLOT_FEET},
			{2169, CONST_SLOT_RING}
		},
		[7] = { -- Royal Paladin
			{2498, CONST_SLOT_HEAD},
			{2173, CONST_SLOT_NECKLACE},
			{1988, CONST_SLOT_BACKPACK},
			{2663, CONST_SLOT_ARMOR},
			{2456, CONST_SLOT_RIGHT},
			{2520, CONST_SLOT_LEFT},
			{2647, CONST_SLOT_LEGS},
			{2195, CONST_SLOT_FEET},
			{2169, CONST_SLOT_RING},
			{7364, CONST_SLOT_AMMO, 100}
		},
		[5] = { -- Master Sorcerer
			{2323, CONST_SLOT_HEAD},
			{2173, CONST_SLOT_NECKLACE},
			{1988, CONST_SLOT_BACKPACK},
			{2656, CONST_SLOT_ARMOR},
			{2187, CONST_SLOT_RIGHT},
			{2175, CONST_SLOT_LEFT},
			{2647, CONST_SLOT_LEGS},
			{2195, CONST_SLOT_FEET},
			{2167, CONST_SLOT_RING}
		},
		[6] = { -- Elder Druid
			{2323, CONST_SLOT_HEAD},
			{2173, CONST_SLOT_NECKLACE},
			{1988, CONST_SLOT_BACKPACK},
			{2656, CONST_SLOT_ARMOR},
			{2181, CONST_SLOT_RIGHT},
			{2175, CONST_SLOT_LEFT},
			{2647, CONST_SLOT_LEGS},
			{2195, CONST_SLOT_FEET},
			{2167, CONST_SLOT_RING}
		}
	},
	supplies = {
		[8] = {{2273, 100}, {7591, 50}, {2293, 20}, {2160, 20}},
		[7] = {{2273, 100}, {7591, 50}, {2293, 20}, {2160, 20}, {7364, 100}},
		[5] = {{2273, 80}, {2268, 80}, {2293, 20}, {7589, 80}, {2160, 20}},
		[6] = {{2273, 80}, {2268, 80}, {2293, 20}, {7589, 80}, {2160, 20}}
	}
}

WAR.kit[4] = WAR.kit[8]
WAR.kit[3] = WAR.kit[7]
WAR.kit[1] = WAR.kit[5]
WAR.kit[2] = WAR.kit[6]
WAR.supplies[4] = WAR.supplies[8]
WAR.supplies[3] = WAR.supplies[7]
WAR.supplies[1] = WAR.supplies[5]
WAR.supplies[2] = WAR.supplies[6]

local function teamOf(player)
	local name = player:getName()
	if name:find("Antica", 1, true) then
		return "antica"
	end
	if name:find("Amera", 1, true) then
		return "amera"
	end
	return nil
end

local function isWarPlayer(player)
	return player:getGroup():getId() < 3 and teamOf(player) ~= nil
end

local function clearSlots(player)
	for slot = CONST_SLOT_HEAD, CONST_SLOT_AMMO do
		local item = player:getSlotItem(slot)
		if item then
			item:remove()
		end
	end
end

local function equip(player, itemId, slot, count)
	local item = Game.createItem(itemId, count or 1)
	if not item then
		print("[WorldWar] missing item id " .. itemId)
		return
	end
	if player:addItemEx(item, true, slot) ~= RETURNVALUE_NOERROR then
		player:addItem(itemId, count or 1)
	end
end

local function kitPlayer(player)
	clearSlots(player)
	local voc = player:getVocation():getId()
	local kit = WAR.kit[voc]
	if kit then
		for i = 1, #kit do
			equip(player, kit[i][1], kit[i][2], kit[i][3])
		end
	end
	local supplies = WAR.supplies[voc]
	if supplies then
		for i = 1, #supplies do
			player:addItem(supplies[i][1], supplies[i][2])
		end
	end
	for i = 1, 5 do
		if not player:hasBlessing(i) then
			player:addBlessing(i, 1)
		end
	end
	player:removeCondition(CONDITION_HASTE)
	local haste = Condition(CONDITION_HASTE)
	haste:setParameter(CONDITION_PARAM_TICKS, -1)
	haste:setParameter(CONDITION_PARAM_SPEED, 80)
	player:addCondition(haste)
	player:setHealth(player:getMaxHealth())
	player:setMana(player:getMaxMana())
end

local function sendToTemple(player)
	local team = teamOf(player)
	if not team then
		return
	end
	player:teleportTo(WAR.spawns[team])
	player:setDirection(team == "antica" and DIRECTION_EAST or DIRECTION_WEST)
end

local login = CreatureEvent("WorldWarLogin")
function login.onLogin(player)
	player:registerEvent("WorldWarPrepareDeath")
	if not isWarPlayer(player) then
		return true
	end
	kitPlayer(player)
	sendToTemple(player)
	player:sendTextMessage(MESSAGE_STATUS_CONSOLE_BLUE, "World War: Antica vs Amera. You are kitted. If a name is taken, pick another.")
	return true
end
login:register()

local prepareDeath = CreatureEvent("WorldWarPrepareDeath")
function prepareDeath.onPrepareDeath(creature, killer)
	if not creature:isPlayer() then
		return true
	end
	local player = creature
	if not isWarPlayer(player) then
		return true
	end
	local killerPlayer = killer and killer:getPlayer() or nil
	if killerPlayer and killerPlayer ~= player then
		killerPlayer:addItem(2160, 1)
		killerPlayer:sendTextMessage(MESSAGE_STATUS_CONSOLE_ORANGE, "You fragged " .. player:getName() .. ".")
		Game.broadcastMessage(killerPlayer:getName() .. " fragged " .. player:getName() .. ".", MESSAGE_STATUS_CONSOLE_ORANGE)
	end
	kitPlayer(player)
	sendToTemple(player)
	player:sendTextMessage(MESSAGE_STATUS_WARNING, "You died. Back to your temple, fully equipped.")
	return false
end
prepareDeath:register()
