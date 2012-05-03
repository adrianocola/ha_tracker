exports.Items = {
    '1':
        {
            itemImg: "/images/items/knight.png",
            itemName: "Knight",
            itemCountMax: 3
        },
    '2':
        {
            itemImg: "/images/items/archer.png",
            itemName: "Archer",
            itemCountMax: 3
        },
    '3':
        {
            itemImg: "/images/items/cleric.png",
            itemName: "Cleric",
            itemCountMax: 3
        },
    '4':
        {
            itemImg: "/images/items/wizard.png",
            itemName: "Wizard",
            itemCountMax: 3
        },
    '5':
        {
            itemImg: "/images/items/ninja.png",
            itemName: "Ninja",
            itemCountMax: 1
        },
    '6':
        {
            itemImg: "/images/items/inferno.png",
            itemName: "Inferno",
            itemCountMax: 2
        },
    '7':
        {
            itemImg: "/images/items/runemetal.png",
            itemName: "Runemetal",
            itemCountMax: 3
        },
    '8':
        {
            itemImg: "/images/items/dragonscale.png",
            itemName: "Dragonscale",
            itemCountMax: 3
        },
    '9':
        {
            itemImg: "/images/items/shininghelm.png",
            itemName: "Shining Helm",
            itemCountMax: 3
        },
    '10':
        {
            itemImg: "/images/items/revivepotion.png",
            itemName: "Revive Potion",
            itemCountMax: 2
        },
    '11':
        {
            itemImg: "/images/items/supercharge.png",
            itemName: "Super Charge",
            itemCountMax: 2
        },
    '12':
        {
            itemImg: "/images/items/voidmonk.png",
            itemName: "Void Monk",
            itemCountMax: 3
        },
    '13':
        {
            itemImg: "/images/items/impaler.png",
            itemName: "Impaler",
            itemCountMax: 3
        },
    '14':
        {
            itemImg: "/images/items/necromancer.png",
            itemName: "Necromancer",
            itemCountMax: 3
        },
    '15':
        {
            itemImg: "/images/items/priestess.png",
            itemName: "Priestess",
            itemCountMax: 3
        },
    '16':
        {
            itemImg: "/images/items/wraith.png",
            itemName: "Wraith",
            itemCountMax: 1
        },
    '17':
        {
            itemImg: "/images/items/soulharvest.png",
            itemName: "Soul Harvest",
            itemCountMax: 2
        },
    '18':
        {
            itemImg: "/images/items/soulstone.png",
            itemName: "Soul Stone",
            itemCountMax: 3
        },
    '19':
        {
            itemImg: "/images/items/manavial.png",
            itemName: "Mana Vial",
            itemCountMax: 2
        },
    '20':
        {
            itemImg: "/images/items/paladin.png",
            itemName: "Paladin",
            itemCountMax: 3
        },
    '21':
        {
            itemImg: "/images/items/gunner.png",
            itemName: "Gunner",
            itemCountMax: 3
        },
    '22':
        {
            itemImg: "/images/items/grenadier.png",
            itemName: "Grenadier",
            itemCountMax: 3
        },
    '23':
        {
            itemImg: "/images/items/engineer.png",
            itemName: "Engineer",
            itemCountMax: 3
        },
    '24':
        {
            itemImg: "/images/items/annihilator.png",
            itemName: "Annihilator",
            itemCountMax: 1
        },
    '25':
        {
            itemImg: "/images/items/pulverizer.png",
            itemName: "The Pulverizer",
            itemCountMax: 2
        },
    '26':
        {
            itemImg: "/images/items/dwarvenbrew.png",
            itemName: "Dwarven Brew",
            itemCountMax: 2
        },
    '27':
        {
            itemImg: "/images/items/warrior.png",
            itemName: "Warrior",
            itemCountMax: 3
        },
    '28':
        {
            itemImg: "/images/items/axethrower.png",
            itemName: "Axe Thrower",
            itemCountMax: 3
        },
    '29':
        {
            itemImg: "/images/items/witch.png",
            itemName: "Witch",
            itemCountMax: 3
        },
    '30':
        {
            itemImg: "/images/items/shaman.png",
            itemName: "Shaman",
            itemCountMax: 3
        },
    '31':
        {
            itemImg: "/images/items/chieftain.png",
            itemName: "Chieftan",
            itemCountMax: 2
        },
    '32':
        {
            itemImg: "/images/items/typhoon.png",
            itemName: "Typhoon",
            itemCountMax: 2
        },
    '33':
        {
            itemImg: "/images/items/spikearmor.png",
            itemName: "Spike Armor",
            itemCountMax: 2
        },
    '34':
        {
            itemImg: "/images/items/haunchofmeat.png",
            itemName: "Haunch of Meat",
            itemCountMax: 2
        }
}

exports.Council = {
    raceName: "Council",
    raceTitle: "/images/council.png",
    raceIcon: "/images/council_icon.png",
    items: [1,2,3,4,5,6,7,8,9,10,11]
}

exports.DarkElves = {
    raceName: "Dark Elves",
    raceTitle: "/images/darkelves.png",
    raceIcon: "/images/darkelves_icon.png",
    items: [12,13,14,15,16,17,18,19,7,9,11]
}

exports.Dwarves = {
    raceName: "Dwarves",
    raceTitle: "/images/dwarves.png",
    raceIcon: "/images/dwarves_icon.png",
    items: [20,21,22,23,24,25,26,7,8,9,11]
}

exports.Tribe = {
    raceName: "Tribe",
    raceTitle: "/images/tribe.png",
    raceIcon: "/images/tribe_icon.png",
    items: [27,28,29,30,31,32,7,33,34]
}

exports.Races = [exports.Council, exports.DarkElves, exports.Dwarves, exports.Tribe];