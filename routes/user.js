var app = require('../app.js');
var models = require('../conf/models.js');
var env = require('../conf/env.js');
var common = require('./common.js');
var uuid = require('../api/uuid.js');
var md5 = require('../public/scripts/shared/md5.js');
var sha1 = require('../public/scripts/shared/sha1.js');
var u = require('underscore');
var https = require('https');
var http = require('http');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var consts = require('../public/scripts/shared/consts.js');


var ids = ["4fe5012b14f03e0100000379","4fe5012b14f03e010000038c","4fe5012d14f03e01000004fd","4fe5012d14f03e0100000514","4fe5013214f03e01000008f8","4fe5013214f03e010000090f","4fe5013214f03e0100000988","4fe5013214f03e010000099f","4fe5013214f03e01000009d2","4fe5013214f03e01000009e9","4fe5013314f03e0100000b99","4fe5013314f03e0100000bb0","4fe5016514f03e0100000faa","4fe5016514f03e0100000fc1","4fe5016614f03e010000115b","4fe5016614f03e0100001172","4fe5016914f03e010000144a","4fe5016914f03e0100001461","4fe5016a14f03e0100001712","4fe5016a14f03e0100001729","4fe5016b14f03e01000018bb","4fe5016b14f03e01000018d2","4fe5016c14f03e0100001a45","4fe5016c14f03e0100001a5c","4fe501c614f03e01000020e0","4fe501c614f03e01000020f7","4fe501c714f03e01000023d9","4fe501c714f03e01000023ec","4fe501c914f03e0100002926","4fe501c914f03e0100002939","4fe501cd14f03e01000032d6","4fe501cd14f03e01000032ed","4fe501ce14f03e01000036a1","4fe501ce14f03e01000036b8","4fe501cf14f03e01000037ee","4fe501cf14f03e0100003805","4fe5020f14f03e01000048cc","4fe5020f14f03e01000048e3","4fe5021214f03e0100004b04","4fe5021214f03e0100004b1b","4fe5021c14f03e010000512c","4fe5021c14f03e0100005143","4fe5022514f03e010000578c","4fe5022514f03e010000579f","4fe5024114f03e010000607f","4fe5024114f03e0100006096","4fe5024714f03e01000065a6","4fe5024714f03e01000065b9","4fe5025114f03e0100006cce","4fe5025114f03e0100006ce5","4fe5025c14f03e01000075fb","4fe5025c14f03e010000760e","4fe5027b14f03e01000090ea","4fe5027b14f03e0100009101","4fe5062d14f03e01000098a7","4fe5062d14f03e01000098be","4fe5062e14f03e01000099bc","4fe5062e14f03e01000099d3","4fe5063114f03e0100009be9","4fe5063114f03e0100009c00","4fe5063514f03e0100009f30","4fe5063514f03e0100009f47","4fe5063c14f03e010000a4b1","4fe5063c14f03e010000a4c8","4fe5064d14f03e010000b4c0","4fe5064d14f03e010000b4d7","4fe5065914f03e010000c09d","4fe5065914f03e010000c0b4","4fe5065d14f03e010000c43c","4fe5065d14f03e010000c453","4fe5069114f03e010000ccbf","4fe5069114f03e010000ccd6","4fe5069314f03e010000cf60","4fe5069314f03e010000cf77","4fe5069614f03e010000d1e5","4fe5069614f03e010000d1fc","4fe5069714f03e010000d329","4fe5069714f03e010000d340","4fe5012b14f03e0100000344","4fe5012b14f03e010000035b","4fe5012b14f03e01000003aa","4fe5012c14f03e01000003c1","4fe5012d14f03e010000048d","4fe5012d14f03e01000004a0","4fe5012e14f03e0100000546","4fe5012e14f03e010000055d","4fe5012e14f03e01000005f4","4fe5012e14f03e0100000607","4fe5013114f03e01000008b5","4fe5013114f03e01000008c8","4fe5013214f03e0100000940","4fe5013214f03e0100000957","4fe5013314f03e0100000b4a","4fe5013314f03e0100000b61","4fe5013414f03e0100000ce3","4fe5013414f03e0100000cf6","4fe5016614f03e0100001051","4fe5016614f03e0100001068","4fe5016714f03e01000011b9","4fe5016714f03e01000011d0","4fe5016714f03e0100001329","4fe5016714f03e0100001340","4fe5016814f03e01000013ec","4fe5016814f03e01000013ff","4fe5016a14f03e010000177c","4fe5016a14f03e010000178f","4fe5016b14f03e0100001928","4fe5016b14f03e010000193f","4fe5016b14f03e01000019d5","4fe5016b14f03e01000019ec","4fe5016c14f03e0100001b20","4fe5016c14f03e0100001b37","4fe5016d14f03e0100001c06","4fe5016d14f03e0100001c1d","4fe5016d14f03e0100001dd8","4fe5016d14f03e0100001deb","4fe5016e14f03e0100001e4d","4fe5016e14f03e0100001e64","4fe501c814f03e0100002673","4fe501c814f03e0100002686","4fe501cb14f03e0100002da6","4fe501cb14f03e0100002dbd","4fe501ce14f03e01000034b5","4fe501ce14f03e01000034cc","4fe501fd14f03e0100003d02","4fe501fd14f03e0100003d15","4fe5021114f03e0100004a47","4fe5021114f03e0100004a5e","4fe5021e14f03e01000052b9","4fe5021e14f03e01000052d0","4fe5022c14f03e0100005ba0","4fe5022c14f03e0100005bb7","4fe5023114f03e0100005efe","4fe5023114f03e0100005f11","4fe5024514f03e01000063ed","4fe5024514f03e0100006400","4fe5024614f03e01000064c9","4fe5024614f03e01000064e0","4fe5027814f03e0100008dc3","4fe5027814f03e0100008dda","4fe5027914f03e0100008ecf","4fe5027914f03e0100008ee6","4fe5062914f03e010000957a","4fe5062914f03e010000958d","4fe5064714f03e010000aef1","4fe5064714f03e010000af08","4fe5064c14f03e010000b397","4fe5064c14f03e010000b3aa","4fe5064e14f03e010000b5ee","4fe5064e14f03e010000b605","4fe5065014f03e010000b845","4fe5065014f03e010000b85c","4fe5065514f03e010000bd07","4fe5065514f03e010000bd1a","4fe5065a14f03e010000c1d1","4fe5065a14f03e010000c1e8","4fe506a914f03e010000e67d","4fe506a914f03e010000e694","4fe506c014f03e010000fd69","4fe506c014f03e010000fd80","4fe506ca14f03e01000108a1","4fe506ca14f03e01000108b8","4fe5012b14f03e010000030f","4fe5012b14f03e0100000326","4fe5012c14f03e01000003df","4fe5012c14f03e01000003f6","4fe5012d14f03e01000004c3","4fe5012d14f03e01000004da","4fe5012e14f03e010000062a","4fe5012e14f03e0100000641","4fe5012f14f03e010000066a","4fe5012f14f03e0100000681","4fe5012f14f03e010000076a","4fe5012f14f03e0100000781","4fe5013014f03e01000007ad","4fe5013014f03e01000007c4","4fe5013114f03e01000007f1","4fe5013114f03e0100000808","4fe5013314f03e0100000a64","4fe5013314f03e0100000a7b","4fe5013314f03e0100000ab1","4fe5013314f03e0100000ac8","4fe5013314f03e0100000afb","4fe5013314f03e0100000b12","4fe5013414f03e0100000d34","4fe5013414f03e0100000d4b","4fe5016514f03e0100000eac","4fe5016514f03e0100000ec3","4fe5016614f03e0100000fff","4fe5016614f03e0100001012","4fe5016614f03e0100001101","4fe5016614f03e0100001118","4fe5016714f03e0100001273","4fe5016714f03e0100001286","4fe5016814f03e010000138a","4fe5016814f03e01000013a1","4fe5016914f03e0100001512","4fe5016914f03e0100001529","4fe5016a14f03e0100001642","4fe5016a14f03e0100001659","4fe5016a14f03e01000016aa","4fe5016a14f03e01000016c1","4fe5016b14f03e01000017e3","4fe5016b14f03e01000017fa","4fe5016c14f03e0100001ab6","4fe5016c14f03e0100001ac9","4fe5016d14f03e0100001c7b","4fe5016d14f03e0100001c92","4fe5016d14f03e0100001d60","4fe5016d14f03e0100001d77","4fe501c614f03e01000022d8","4fe501c614f03e01000022eb","4fe501ca14f03e0100002acb","4fe501ca14f03e0100002ae2","4fe501ca14f03e0100002b5e","4fe501ca14f03e0100002b75","4fe501cc14f03e0100002ed3","4fe501cc14f03e0100002ee6","4fe501cc14f03e010000309c","4fe501cc14f03e01000030af","4fe501cd14f03e0100003417","4fe501cd14f03e010000342e","4fe5020114f03e0100003f0e","4fe5020114f03e0100003f21","4fe5020d14f03e0100004755","4fe5020d14f03e010000476c","4fe5021614f03e0100004d49","4fe5021614f03e0100004d60","4fe5021a14f03e0100005063","4fe5021a14f03e010000507a","4fe5024d14f03e0100006a16","4fe5024d14f03e0100006a2d","4fe5024f14f03e0100006be5","4fe5024f14f03e0100006bfc","4fe5025614f03e010000715a","4fe5025614f03e010000716d","4fe5026114f03e01000079c9","4fe5026114f03e01000079e0","4fe5026414f03e0100007cb0","4fe5026414f03e0100007cc3","4fe5027014f03e010000869b","4fe5027014f03e01000086b2","4fe5027414f03e0100008aa9","4fe5027414f03e0100008abc","4fe5063e14f03e010000a6f2","4fe5063e14f03e010000a709","4fe5065e14f03e010000c577","4fe5065e14f03e010000c58e","4fe5068f14f03e010000cb77","4fe5068f14f03e010000cb8e","4fe506a114f03e010000dd65","4fe506a114f03e010000dd78","4fe506aa14f03e010000e7cd","4fe506aa14f03e010000e7e4","4fe5012f14f03e0100000729","4fe5012f14f03e0100000740","4fe5013114f03e0100000875","4fe5013114f03e010000088c","4fe5013214f03e0100000a1c","4fe5013214f03e0100000a2f","4fe5013414f03e0100000bea","4fe5013414f03e0100000c01","4fe5013414f03e0100000c3c","4fe5013414f03e0100000c53","4fe5013414f03e0100000c8f","4fe5013414f03e0100000ca6","4fe5016514f03e0100000f58","4fe5016514f03e0100000f6f","4fe5016614f03e01000010ab","4fe5016614f03e01000010c2","4fe5016914f03e01000014ae","4fe5016914f03e01000014c5","4fe5016914f03e0100001574","4fe5016914f03e010000158b","4fe5016b14f03e010000184e","4fe5016b14f03e0100001865","4fe5016c14f03e0100001b92","4fe5016c14f03e0100001ba9","4fe5016d14f03e0100001cf1","4fe5016d14f03e0100001d04","4fe501c614f03e01000021de","4fe501c614f03e01000021f5","4fe501c714f03e01000024df","4fe501c714f03e01000024f6","4fe501c814f03e01000025e9","4fe501c814f03e0100002600","4fe501cb14f03e0100002e3e","4fe501cb14f03e0100002e51","4fe501cd14f03e010000323b","4fe501cd14f03e010000324e","4fe501f914f03e0100003a5c","4fe501f914f03e0100003a6f","4fe501fa14f03e0100003b03","4fe501fa14f03e0100003b1a","4fe501fb14f03e0100003bab","4fe501fb14f03e0100003bc2","4fe5020314f03e010000406b","4fe5020314f03e0100004082","4fe5020914f03e010000449e","4fe5020914f03e01000044b5","4fe5021514f03e0100004c89","4fe5021514f03e0100004ca0","4fe5021814f03e0100004ed4","4fe5021814f03e0100004eeb","4fe5021914f03e0100004f9b","4fe5021914f03e0100004fb2","4fe5022214f03e01000055ef","4fe5022214f03e0100005602","4fe5022714f03e0100005856","4fe5022714f03e010000586d","4fe5022914f03e0100005929","4fe5022914f03e0100005940","4fe5022a14f03e01000059fd","4fe5022a14f03e0100005a14","4fe5022b14f03e0100005ace","4fe5022b14f03e0100005ae5","4fe5024414f03e010000630e","4fe5024414f03e0100006325","4fe5024c14f03e0100006930","4fe5024c14f03e0100006947","4fe5025214f03e0100006db4","4fe5025214f03e0100006dcb","4fe5026b14f03e0100008295","4fe5026b14f03e01000082ac","4fe5063214f03e0100009d01","4fe5063214f03e0100009d18","4fe5063314f03e0100009e1a","4fe5063314f03e0100009e31","4fe5063814f03e010000a163","4fe5063814f03e010000a17a","4fe5063b14f03e010000a392","4fe5063b14f03e010000a3a9","4fe5064214f03e010000aa57","4fe5064214f03e010000aa6e","4fe5064914f03e010000b144","4fe5064914f03e010000b157","4fe5064f14f03e010000b719","4fe5064f14f03e010000b730","4fe5065314f03e010000baa4","4fe5065314f03e010000babb","4fe5069814f03e010000d46e","4fe5069814f03e010000d485","4fe5069b14f03e010000d6fb","4fe5069b14f03e010000d712","4fe506b214f03e010000efd2","4fe506b214f03e010000efe9","4fe506b414f03e010000f281","4fe506b414f03e010000f294","4fe506b614f03e010000f3da","4fe506b614f03e010000f3ed","4fe506be14f03e010000fc05","4fe506be14f03e010000fc1c","4fe506c114f03e010000fece","4fe506c114f03e010000fee5","4fe501c714f03e0100002358","4fe501c714f03e010000236f","4fe501c814f03e01000026f9","4fe501c814f03e0100002710","4fe501cc14f03e010000319d","4fe501cc14f03e01000031b4","4fe501cd14f03e0100003376","4fe501cd14f03e010000338d","4fe501fe14f03e0100003dad","4fe501fe14f03e0100003dc4","4fe5021714f03e0100004e0e","4fe5021714f03e0100004e25","4fe5024214f03e010000615b","4fe5024214f03e010000616e","4fe5024a14f03e0100006767","4fe5024a14f03e010000677e","4fe5024b14f03e010000684b","4fe5024b14f03e0100006862","4fe5025314f03e0100006e9f","4fe5025314f03e0100006eb6","4fe5025414f03e0100006f87","4fe5025414f03e0100006f9e","4fe5025514f03e0100007070","4fe5025514f03e0100007087","4fe5026214f03e0100007ac1","4fe5026214f03e0100007ad4","4fe5026d14f03e0100008494","4fe5026d14f03e01000084ab","4fe5026f14f03e0100008597","4fe5026f14f03e01000085ae","4fe5027214f03e01000088a2","4fe5027214f03e01000088b5","4fe5063714f03e010000a04b","4fe5063714f03e010000a062","4fe5064314f03e010000ab7c","4fe5064314f03e010000ab93","4fe5065714f03e010000be38","4fe5065714f03e010000be4f","4fe5069214f03e010000ce11","4fe5069214f03e010000ce28","4fe5069414f03e010000d0a2","4fe5069414f03e010000d0b9","4fe5069e14f03e010000dad2","4fe5069e14f03e010000dae9","4fe5069f14f03e010000dc1d","4fe5069f14f03e010000dc30","4fe506a814f03e010000e52e","4fe506a814f03e010000e545","4fe506b114f03e010000ee78","4fe506b114f03e010000ee8f","4fe506bd14f03e010000faa2","4fe506bd14f03e010000fab9","4fe506c614f03e0100010468","4fe506c614f03e010001047f","4fe501c614f03e0100002259","4fe501c614f03e0100002270","4fe501c714f03e0100002564","4fe501c714f03e0100002577","4fe501c814f03e0100002785","4fe501c814f03e010000279c","4fe501cc14f03e0100002f69","4fe501cc14f03e0100002f80","4fe501ce14f03e0100003558","4fe501ce14f03e010000356f","4fe501ce14f03e01000035fc","4fe501ce14f03e0100003613","4fe501ce14f03e0100003747","4fe501ce14f03e010000375e","4fe501f614f03e0100003909","4fe501f614f03e0100003920","4fe501fc14f03e0100003c54","4fe501fc14f03e0100003c6b","4fe5020414f03e010000411b","4fe5020414f03e0100004132","4fe5020814f03e01000043e5","4fe5020814f03e01000043fc","4fe5020b14f03e0100004558","4fe5020b14f03e010000456f","4fe5020e14f03e010000480e","4fe5020e14f03e0100004825","4fe5021f14f03e0100005385","4fe5021f14f03e010000539c","4fe5022d14f03e0100005c77","4fe5022d14f03e0100005c8a","4fe5025914f03e010000732d","4fe5025914f03e0100007344","4fe5025f14f03e01000078d2","4fe5025f14f03e01000078e9","4fe5026514f03e0100007da7","4fe5026514f03e0100007dbe","4fe5027714f03e0100008cb8","4fe5027714f03e0100008ccf","4fe5027a14f03e0100008fdc","4fe5027a14f03e0100008ff3","4fe5063014f03e0100009ad2","4fe5063014f03e0100009ae9","4fe5064014f03e010000a814","4fe5064014f03e010000a82b","4fe5065814f03e010000bf6a","4fe5065814f03e010000bf7d","4fe506a214f03e010000deae","4fe506a214f03e010000dec5","4fe506a614f03e010000e293","4fe506a614f03e010000e2a6","4fe506a714f03e010000e3e0","4fe506a714f03e010000e3f3","4fe506ac14f03e010000e91e","4fe506ac14f03e010000e935","4fe506af14f03e010000ed23","4fe506af14f03e010000ed36","4fe506b914f03e010000f687","4fe506b914f03e010000f69a","4fe506ba14f03e010000f7df","4fe506ba14f03e010000f7f6","4fe506c314f03e010001019b","4fe506c314f03e01000101ae","4fe501c614f03e010000215f","4fe501c614f03e0100002176","4fe501cb14f03e0100002c82","4fe501cb14f03e0100002c95","4fe501f814f03e01000039b2","4fe501f814f03e01000039c9","4fe5020714f03e0100004335","4fe5020714f03e0100004348","4fe5020c14f03e010000469d","4fe5020c14f03e01000046b0","4fe5021014f03e0100004987","4fe5021014f03e010000499e","4fe5023014f03e0100005e24","4fe5023014f03e0100005e3b","4fe5024314f03e0100006234","4fe5024314f03e010000624b","4fe5024914f03e0100006684","4fe5024914f03e010000669b","4fe5024e14f03e0100006afd","4fe5024e14f03e0100006b14","4fe5025e14f03e01000077dc","4fe5025e14f03e01000077f3","4fe5026714f03e0100007ea3","4fe5026714f03e0100007eba","4fe5027114f03e010000879c","4fe5027114f03e01000087b3","4fe5062814f03e0100009469","4fe5062814f03e0100009480","4fe5064114f03e010000a937","4fe5064114f03e010000a94a","4fe5064414f03e010000aca2","4fe5064414f03e010000acb9","4fe5064614f03e010000adc9","4fe5064614f03e010000ade0","4fe5064b14f03e010000b26b","4fe5064b14f03e010000b282","4fe5065214f03e010000b976","4fe5065214f03e010000b98d","4fe506bc14f03e010000f940","4fe506bc14f03e010000f957","4fe506c214f03e0100010034","4fe506c214f03e010001004b","4fe501c814f03e010000280d","4fe501c814f03e0100002820","4fe501c914f03e0100002897","4fe501c914f03e01000028ae","4fe501ca14f03e0100002a3a","4fe501ca14f03e0100002a51","4fe501cc14f03e0100003004","4fe501cc14f03e0100003017","4fe501ff14f03e0100003e5d","4fe501ff14f03e0100003e74","4fe5020514f03e01000041d0","4fe5020514f03e01000041e7","4fe5022114f03e0100005520","4fe5022114f03e0100005537","4fe5022414f03e01000056bb","4fe5022414f03e01000056d2","4fe5022f14f03e0100005d4b","4fe5022f14f03e0100005d62","4fe5025714f03e0100007245","4fe5025714f03e0100007258","4fe5025b14f03e010000750c","4fe5025b14f03e0100007523","4fe5026814f03e0100007fa0","4fe5026814f03e0100007fb7","4fe5026914f03e010000809e","4fe5026914f03e01000080b1","4fe5026a14f03e0100008199","4fe5026a14f03e01000081ac","4fe5027314f03e01000089a5","4fe5027314f03e01000089bc","4fe5062c14f03e0100009793","4fe5062c14f03e01000097aa","4fe5063d14f03e010000a5d1","4fe5063d14f03e010000a5e8","4fe5064814f03e010000b01a","4fe5064814f03e010000b031","4fe5065f14f03e010000c6af","4fe5065f14f03e010000c6c2","4fe5069914f03e010000d5b4","4fe5069914f03e010000d5cb","4fe5069c14f03e010000d83f","4fe5069c14f03e010000d856","4fe5069d14f03e010000d988","4fe5069d14f03e010000d99f","4fe506a314f03e010000dffc","4fe506a314f03e010000e013","4fe506ae14f03e010000ebcb","4fe506ae14f03e010000ebe2","4fe506b314f03e010000f12d","4fe506b314f03e010000f140","4fe506c714f03e01000105d2","4fe506c714f03e01000105e5","4fe506c814f03e0100010739","4fe506c814f03e010001074c","4fe501c714f03e010000245a","4fe501c714f03e0100002471","4fe501c914f03e01000029ad","4fe501c914f03e01000029c4","4fe501cb14f03e0100002bf2","4fe501cb14f03e0100002c09","4fe501cb14f03e0100002d14","4fe501cb14f03e0100002d27","4fe5020214f03e0100003fb8","4fe5020214f03e0100003fcf","4fe5020614f03e0100004282","4fe5020614f03e0100004299","4fe5021314f03e0100004bc6","4fe5021314f03e0100004bdd","4fe5021d14f03e01000051f2","4fe5021d14f03e0100005209","4fe5022014f03e0100005452","4fe5022014f03e0100005469","4fe5025a14f03e010000741e","4fe5025a14f03e0100007431","4fe5025d14f03e01000076e7","4fe5025d14f03e01000076fe","4fe5026314f03e0100007bb6","4fe5026314f03e0100007bcd","4fe5026c14f03e0100008396","4fe5026c14f03e01000083a9","4fe5027614f03e0100008bae","4fe5027614f03e0100008bc5","4fe5062614f03e0100009359","4fe5062614f03e0100009370","4fe5062a14f03e0100009684","4fe5062a14f03e0100009697","4fe5063914f03e010000a27c","4fe5063914f03e010000a28f","4fe5065414f03e010000bbd7","4fe5065414f03e010000bbee","4fe5065b14f03e010000c306","4fe5065b14f03e010000c31d","4fe5066014f03e010000c7e8","4fe5066014f03e010000c7fb","4fe506a414f03e010000e147","4fe506a414f03e010000e15a","4fe506ad14f03e010000ea74","4fe506ad14f03e010000ea8b","4fe506b714f03e010000f530","4fe506b714f03e010000f543","4fe506c514f03e01000102ff","4fe506c514f03e0100010316","4fe5416814f03e0100011ab2","4fe5416814f03e0100011ac9"];



// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    host : "smtp.gmail.com",
    port : "465",
    secureConnection: true,
    auth: {
        user: env.secrets.mail_username,
        pass: env.secrets.mail_password
    }
});


function clearCookies(res){

    res.clearCookie('KEEP_LOGGED_HASH');
    res.clearCookie('X-HATracker-Token');

};

function clearAuthorization(req, res){

    if(req.authorization){
        req.authorization.destroy();
    }

    clearCookies(res);

};

/**
 * Validate the generated nonce, to make sure the nonce the client
 * passes to the server was the one created on the server
 * @param nonce nonce to validate
 * @param fn return true or false in callback
 */
function validateNonce(nonce, next, fn){

    app.redis.get('nonce:' + nonce, function(err,value){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(value!=null){
            //if the nonce is valid remove it from the valid nonces list, so it
            //cannot be used again to try to relogin
            app.redis.del('nonce:' + nonce,function(){
                fn(true);
            });
        }else{
            fn(false);
        }

    });

}

/**
 * generates a nonce for password cryptography
 * more details: http://en.wikipedia.org/wiki/Cryptographic_nonce
 */
app.get('/api/nonce', function(req, res, next){

    var nonce = uuid.uuid(10);

    var multi = app.redis.multi();

    multi.set('nonce:' + nonce, '');
    multi.expire('nonce:' + nonce, 60);

    multi.exec(function(err,value){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        res.send(nonce);

    });

});


app.get('/api/user/logout', common.verifyAuthorization, function(req, res, next){


    if(!req.authorization){
        next(new app.ExpectedError(105, "Not logged"));
        return;
    }


    models.User.findById(req.authorization.userId,{}, common.userId('MASTER'), function(err,user){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!user){
            next(new app.UnexpectedError("User is null"));
            return;
        }

        //if is a facebook user, clean facebook access token
        if(user.facebook.userID){

            user.facebook.accessToken = undefined;
            user.facebook.expiresIn = undefined;

            user.save(common.userId('MASTER'),function(err){

                if(err){
                    next(new app.UnexpectedError(err));
                    return;
                }

                if(err) next(new app.UnexpectedError(err));

            });

        }

        if(req.cookies.KEEP_LOGGED_HASH){
            app.redis.del("keeplogged:" + req.cookies.KEEP_LOGGED_HASH);
        }



        clearAuthorization(req,res);

        res.send({});



    });

});


app.get('/api/user/login', function(req,res,next){

    //validate nonce
    validateNonce(req.query.nonce, next, function(valid){

        if(!valid){
            clearAuthorization(req,res);
            next(new app.ExpectedError(110,"Invalid Nonce"));
            return;
        }

        //if login request have username and password, tries to login using credentials
        if(!req.query.username || !req.query.password){
            clearAuthorization(req,res);
            next(new app.ExpectedError(109,"Missing Login Credentials"));
            return;
        }

        models.User.findOne({username: req.query.username.toLowerCase()},{}, common.userId('MASTER'), function(err,user){


            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            if(!user || req.query.password != md5.hex_md5(user.password + req.query.nonce)){

                clearCookies(res);
                next(new app.ExpectedError(101,"Invalid username or password"));

                return;

            }

            req.generateAuthorization(function(authorization){

                req.authorization.userId = user._id;

                if(req.query.keepLogged){

                    var keep_logged_hash = uuid.uuid(48);

                    var multi = app.redis.multi();

                    multi.set('keeplogged:' + keep_logged_hash, user._id);
                    multi.expire('keeplogged:' + keep_logged_hash, 1209600); //2 weeks = 1209600 s

                    multi.exec(function(err,value){

                        if(err){
                            next(new app.UnexpectedError(err));
                            return;
                        }

                        //2 weeks = 1209600000 ms
                        res.cookie('KEEP_LOGGED_HASH', keep_logged_hash, { maxAge: 1209600000 });


                        var secureUser = user.secure();
                        secureUser._doc.token = req.sessionToken;

                        res.json(secureUser);

                        common.statsMix(req.authorization.userId, 4321,1,{type: 'email', platform: common.isMobile(req)?"mobile":"web"});

                    });

                }else{
                    clearCookies(res);

                    var secureUser = user.secure();
                    secureUser._doc.token = req.sessionToken;

                    res.json(secureUser);

                    common.statsMix(req.authorization.userId, 4321,1,{type: 'email', platform: common.isMobile(req)?"mobile":"web"});
                }


            });


        });

    });




});


app.get('/api/user/continue_login', function(req,res,next){

    if(req.authorization){
        models.User.findById(req.authorization.userId,{}, common.userId(req.authorization.userId), function(err,user){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            if(!user){
                next(new app.ExpectedError(107,"User not exists!"));
                return;
            }

            req.authorization.userId = user._id;

            var secureUser = user.secure();
            secureUser._doc.token = req.sessionToken;

            res.json(secureUser);

            common.statsMix(req.authorization.userId, 4321,1,{type: 'relogin', platform: common.isMobile(req)?"mobile":"web"});

        });

    //user marked option "Keep logged in"
    }else if(req.cookies.KEEP_LOGGED_HASH){

        app.redis.get('keeplogged:' + req.cookies.KEEP_LOGGED_HASH,function(err,value){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            if(value==null){
                clearAuthorization(req,res);
                next(new app.ExpectedError(106,"Session Expired"));
                return;
            }

            models.User.findById(value,{}, common.userId('MASTER'), function(err,user){

                if(err){
                    next(new app.UnexpectedError(err));
                    return;
                }

                if(!user){
                    clearAuthorization(req,res);
                    next(new app.ExpectedError(107,"User not exists!"));
                    return;
                }


                req.generateAuthorization(function(authorization){

                    req.authorization.userId = user._id;

                    var secureUser = user.secure();
                    secureUser._doc.token = req.sessionToken;

                    res.json(secureUser);

                    common.statsMix(req.authorization.userId, 4321,1,{type: 'relogin', platform: common.isMobile(req)?"mobile":"web"});

                });

            });

        });


    }else{
        clearAuthorization(req,res);
        next(new app.ExpectedError(106,"Session Expired"));
    }

});


app.post("/api/user/signup", function(req, res, next){

    var reqsError = "";

    if(req.body.username == undefined || req.body.username == "") reqsError += "Username is Required. ";
    else if(req.body.username.length < 3) reqsError += "Username must have at least 3 characters. ";
    else if(req.body.username.length > 20) reqsError += "Username cannot have more than 20 characters. ";
    else if(req.body.username.match(/[\<\>!@#\$%^&\*, ]+/i)) reqsError += "Username cannot have white spaces or < > ! @ # $ % ^ & *. ";

    if(req.body.email == undefined || req.body.email == "") reqsError += "E-mail is Required. ";
    else if(!req.body.email.match(/\S+@\S+\.\S+/)) reqsError += "Not a valid e-mail address. ";

    if(req.body.password == undefined || req.body.password == "") reqsError += "Password is Required. ";


    if(reqsError.length > 0){
        next(new app.ExpectedError(107,reqsError));
        return;
    }



    var user = new models.User();
    var player = new models.Player();

    user.username = req.body.username.toLowerCase();
    user.password = req.body.password;
    user.email = req.body.email;
    user.player = player;
    user.addACL(user._id,true,true);

    player.user = user;
    player.addACL(user._id,true,true);

    //save user
    user.save( common.userId('MASTER'),function(err){

        if(err){
            console.log(err);
            if(err.code == 11000){
                next(new app.ExpectedError(103,"Username or Email already registered"));
            }else{
                next(new app.UnexpectedError(err));
            }

            return;

        }

        //save player
        player.save(common.userId('MASTER'),function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            clearCookies(res);

            req.generateAuthorization(function(authorization){

                req.authorization.userId = user._id;

                var secureUser = user.secure();
                secureUser._doc.token = req.sessionToken;

                res.json(secureUser);


                common.statsMix(req.authorization.userId, 4320,1,{type: 'email', platform: common.isMobile(req)?"mobile":"web"});

            });


        });


    });


});

app.put("/api/user/change_password",common.verifyAuthorization, function(req, res, next){

    validateNonce(req.body.nonce, next, function(valid){

        if(!valid){
            next(new app.ExpectedError(110,"Invalid Nonce"));
            return;
        }

        models.User.findById(req.authorization.userId,{},common.userId(req.authorization.userId),function(err, user){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            if(!user || req.body.old_password != md5.hex_md5(user.password + req.body.nonce)){
                next(new app.ExpectedError(114,"Wrong current password"));
                return;
            }

            user.password = req.body.new_password;

            user.save(common.userId(req.authorization.userId),function(err){

                if(err){
                    next(new app.UnexpectedError(err));
                    return;
                }

                res.send(true);

            });

        });

    });




});


app.post("/api/user/forgot_password", function(req, res, next){



    models.User.findOne({"email": req.body.email},{}, common.userId('MASTER'), function(err,user){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!user){
            next(new app.ExpectedError(111,"Email not registered!"));
            return;
        }

        crypto.randomBytes(24, function(ex, buf) {
            var confirmation = buf.toString('hex');

            var multi = app.redis.multi();

            //if any previous reset password request has made first invalidate it
            if(user.reset_password){
                multi.del("resetpw:" + user.reset_password);
            }

            multi.set("resetpw:" + confirmation, user._id);
            multi.expire("resetpw:" + confirmation, 86400); //1 day

            multi.exec(function(err,value){

                if(err){
                    next(new app.UnexpectedError(err));
                    return;
                }

                //set the user with the confirmation number
                user.reset_password = confirmation;

                user.save(common.userId(user._id),function(err){

                    if(err){
                        next(new app.UnexpectedError(err));
                        return;
                    }


                    //setup e-mail data with unicode symbols
                    var mailOptions = {
                        generateTextFromHTML: true,
                        from: env.secrets.mail_username,
                        to: user.email,
                        subject: "HATracker - Recover Password",
                        //text: "Click the following link to reset your password: http://" + req.headers.host + "/reset_password?confirmation=" + confirmation
                        html: "Hey <b>" + user.username + "</b>," +
                            "<br><br> Forgot your password? Click the link below to reset your password: " +
                            "<br><br> http://" + req.headers.host + "/reset_password?confirmation=" + confirmation +
                            "<br><br><br><br> Please, don't reply to this address. If you have any questions send an e-mail to contat@hatracker.com" +
                            "<br><br> www.hatracker.com"
                    };

                    // send mail with defined transport object
                    smtpTransport.sendMail(mailOptions, function(err, response){

                        if(err){
                            next(new app.UnexpectedError(err));
                            return;
                        }

                        res.send('true');

                    });

                });

            });

        });

    });



});

app.get("/api/user/reset_password_username", function(req, res, next){

    //get user
    app.redis.get("resetpw:" + req.query.confirmation, function(err,value){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!value){
            next(new app.ExpectedError(112, 'Expired password reset confirmation'));
            return;
        }


        models.User.findById(value,{}, common.userId('MASTER'), function(err,user){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            if(!user){
                next(new app.UnexpectedError("User is null"));
                return;
            }

            if(!value){
                next(new app.ExpectedError(113, 'Invalid user for password reset'));
                return;
            }

            res.json({username: user.username});

        });

    });

});


app.put("/api/user/reset_password", function(req, res, next){

    if(!req.body.password){
        next(new app.ExpectedError(114, 'Must provide password for password reset'));
        return;
    }

    //get user
    app.redis.get("resetpw:" + req.body.confirmation, function(err,value){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!value){
            next(new app.ExpectedError(112, 'Expired password reset confirmation'));
            return;
        }

        models.User.findById(value,{}, common.userId('MASTER'), function(err,user){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            if(!user){
                next(new app.UnexpectedError("User is null"));
                return;
            }

            if(!value){
                next(new app.ExpectedError(413,'Invalid user for password reset'));
                return;
            }

            user.password = req.body.password;
            delete user.reset_password;

            user.save(common.userId(user._id),function(err){

                if(err){
                    next(new app.UnexpectedError(err));
                    return;
                }

                res.send('true');

                //invalidate current change password token
                app.redis.del("resetpw:" + req.body.confirmation);

            });

        });

    });

});


app.get("/api/user/login-facebook", function(req, res, next){

    models.User.findOne({"facebook.userID": req.query.userID},{}, common.userId('MASTER'), function(err,user){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        //found existing user
        if(user){
            //if is startup means that the user is logged in facebook and
            //is registered here as a valid
            if(req.query.startup){
                //check if the user is authenticated here (didn't made logoff)
                if(user.facebook.accessToken != req.query.accessToken){
                    next(new app.ExpectedError(109,"Facebook Session Expired or User Logged out from Facebook"));
                    return;
                }

                req.generateAuthorization(function(){

                    req.authorization.userId = user._id;

                    var secureUser = user.secure();
                    secureUser._doc.token = req.sessionToken;

                    res.send(secureUser);

                    common.statsMix(req.authorization.userId, 4321,1,{type: 'facebook', platform: common.isMobile(req)?"mobile":"web"});

                });

            //if the user is authenticated in facebook but logged off
            // he can click on facebook button again and login
            }else{

                user.facebook.accessToken = req.query.accessToken;
                user.facebook.expiresIn = req.query.expiresIn;

                user.save(common.userId('MASTER'),function(err){

                    if(err){
                        next(new app.UnexpectedError(err));
                        return;
                    }

                    req.generateAuthorization(function(){

                        req.authorization.userId = user._id;

                        var secureUser = user.secure();
                        secureUser._doc.token = req.sessionToken;

                        res.send(secureUser);

                        common.statsMix(req.authorization.userId, 4321,1,{type: 'facebook', platform: common.isMobile(req)?"mobile":"web"});


                    });

                });
            }

        //must create a new user, user signed up via facebook
        //but check if is not startup. If is startup means that the
        //user must first click on facebook button to authenticate
        }else if(!req.query.startup){

            var user = new models.User();
            var player = new models.Player();

            user.facebook = {};

            user.facebook.userID = req.query.userID;
            user.facebook.accessToken = req.query.accessToken;
            user.facebook.expiresIn = req.query.expiresIn;
            user.player = player;
            user.addACL(user._id,true,true);

            player.user = user;
            player.addACL(user._id,true,true);

            user.save( common.userId('MASTER'),function(err){

                if(err){
                    next(new app.UnexpectedError(err));
                    return;
                }

                player.save( common.userId('MASTER'),function(err){

                    if(err){
                        next(new app.UnexpectedError(err));
                        return;
                    }

                    req.generateAuthorization(function(){

                        req.authorization.userId = user._id;

                        var secureUser = user.secure();
                        secureUser._doc.token = req.sessionToken;

                        res.send(secureUser);

                        common.statsMix(req.authorization.userId, 4320,1,{type: 'facebook', platform: common.isMobile(req)?"mobile":"web"});


                    });

                });


            });
            //user is logged in facebook ,don' have account here but is startup
            //so I can' create an account here.
        }else{
            clearAuthorization(req,res);
            next(new app.ExpectedError(108, "Facebook user not authenticated!"));
        }


    });

});


app.delete('/api/user/delete',common.verifyAuthorization, function(req, res, next){


    models.User.findById(req.authorization.userId,{},common.userId(req.authorization.userId),function(err, user){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!user){
            next(new app.UnexpectedError("User is null"));
            return;
        }

        //remove from facebook
        if(user.facebook.userID){
            //https://developers.facebook.com/docs/reference/api/user/
            var request = https.request({
                host: 'graph.facebook.com',
                port: 443,
                path: '/' + user.facebook.userID + "/permissions?access_token=" + user.facebook.accessToken,
                method: 'DELETE'
            },function (response) {
                response.setEncoding('utf8');
                response.on('data', function (chunk) {
                    console.log('Removed from Facebook: ' + chunk);
                });
            });
            request.end();

        }

        user.remove(function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            clearAuthorization(req,res);

            res.send('true');

        });

    });

});


app.delete('/api/user/reset',common.verifyAuthorization, function(req, res, next){

    models.User.findById(req.authorization.userId,{},common.userId(req.authorization.userId),function(err, user){

        if(err){
            next(new app.UnexpectedError(err));
            return;
        }

        if(!user){
            next(new app.UnexpectedError("User is null"));
            return;
        }


        models.Player.findOne({user: req.authorization.userId},{},common.userId(req.authorization.userId),function(err, player){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            if(!player){
                next(new app.UnexpectedError("Player is null"));
                return;
            }


            player.remove(function(err){

                var player = new models.Player();
                player.user = user;
                player.addACL(user._id,true,true);

                user.player = player;

                //save user
                user.save( common.userId('MASTER'),function(err){

                    if(err){

                        if(err.code == 11000){
                            next(new app.ExpectedError(103,"Username or Email already registered") );
                        }else{
                            next(new app.UnexpectedError(err));
                        }

                        return;

                    }

                    //save player
                    player.save(common.userId('MASTER'),function(err){

                        if(err){
                            next(new app.UnexpectedError(err));
                            return;
                        }

                        clearCookies(res);

                        req.authorization.userId = user._id;

                        res.send(true);


                    });



                });

            });
        });



    });

});



app.get('/api/random', function(req, res, next){

    models.User.findById(env.secrets.test_user_id,{},common.userId('MASTER'),function(err, user){


        models.Player.findById(user.player,{}, common.userId('MASTER'), function(err, player){

            var random = Math.floor((Math.random()*100)+1);

            //creates a new enemy
            if(random<1){

                //update position of all enemies
                u.each(player.enemies,function(enemy){
                    enemy.position+=1;
                });

                var enemy = new models.Enemy({name: "enemy"+ uuid.uuid(10)});
                enemy.position = 0;

                player.enemies.push(enemy);

                player.save(common.userId('MASTER'),function(err){

                    if(err){
                        next(new app.UnexpectedError(err));
                        return;
                    }

                    res.send(enemy);

                });

                //create a new game
            }else{
                var enemyIndex = -1;
                if(player.enemies.length == 0){
                    res.send('No enemies yet!');
                    return;
                }else if(player.enemies.length == 1){
                    enemyIndex = 0;
                }else{
                    enemyIndex = Math.floor((Math.random()*1000000)+1)%player.enemies.length;
                }

                var enemy = player.enemies[enemyIndex];

                var game = new models.Game({
                    playerRace: consts.Races[(Math.floor((Math.random()*100)+1)%4)].raceName,
                    enemyRace: consts.Races[(Math.floor((Math.random()*100)+1)%4)].raceName,
                    state: (Math.floor((Math.random()*100)+1)%9)
                });

                //create game notes
                var gameNotes = new models.GameNoteManager();
                gameNotes.addACL(env.secrets.test_user_id,true,true);

                gameNotes.save(common.userId('MASTER'),function(err){
                    if(err) console.log(err);
                });

                game.gameNotes = gameNotes;

                //create player's items
                u.each(consts.Races,function(race){
                    if(game.playerRace === race.raceName){

                        var playerItemManager = new models.ItemManager();

                        u.each(race.items, function(baseItemId){
                            var baseItem = consts.Items[baseItemId];

                            var item = new models.Item({itemId: baseItemId, itemCount: baseItem.itemCountMax});

                            playerItemManager.items.push(item);

                        },this);

                        playerItemManager.addACL(env.secrets.test_user_id,true,true);

                        playerItemManager.save(common.userId('MASTER'),function(err){
                            if(err) console.log(err);
                        });

                        game.playerItems = playerItemManager;
                    }
                })

                //create enemy's items
                u.each(consts.Races,function(race){
                    if(game.enemyRace === race.raceName){

                        var enemyItemManager = new models.ItemManager();

                        u.each(race.items, function(baseItemId){
                            var baseItem = consts.Items[baseItemId];

                            var item = new models.Item({itemId: baseItemId, itemCount: baseItem.itemCountMax});

                            enemyItemManager.items.push(item);

                        },this);

                        enemyItemManager.addACL(env.secrets.test_user_id,true,true);

                        enemyItemManager.save(common.userId('MASTER'),function(err){
                            if(err) console.log(err);
                        });

                        game.enemyItems = enemyItemManager;

                    }
                })

                enemy.gameCount+=1;

                game.num = enemy.gameCount;

                enemy.games.push(game);


                player.save(common.userId('MASTER'),function(err){

                    if(err){
                        next(new app.UnexpectedError(err));
                        return;
                    }

                    res.send(game);

                });

            }



        });

    });

});


app.get('/api/random-item-ids', function(req, res, next){


    models.User.findById(env.secrets.test_user_id,{},common.userId('MASTER'),function(err, user){


        models.Player.findById(user.player,{}, common.userId('MASTER'), function(err, player){


            var ids = [];

            u.each(player.enemies, function(enemy){
                u.each(enemy.games,function(game){
                    ids.push(game.playerItems);
                    ids.push(game.enemyItems);
                });

            });

            res.send(ids);





        });

    });


});


app.get('/api/random-item2', function(req, res, next){

    var itemIdIndex = Math.floor((Math.random()*1000000)+1)%ids.length;

    var itemId = ids[itemIdIndex];

    models.ItemManager.findById(itemId,{}, common.userId('MASTER'), function(err, itemManager){

        var itemIndex = Math.floor((Math.random()*1000000)+1)%itemManager.items.length;

        var item = itemManager.items[itemIndex];

        item.itemCount = item.itemCount == 0 ? 1 : 0;

        itemManager.save(common.userId('MASTER'), function(err){

            if(err){
                next(new app.UnexpectedError(err));
                return;
            }

            res.send(item);

        });

    });

});




app.get('/api/random-item', function(req, res, next){

    models.User.findById(env.secrets.test_user_id,{},common.userId('MASTER'),function(err, user){


        models.Player.findById(user.player,{}, common.userId('MASTER'), function(err, player){


            var enemyIndex = -1;
            if(player.enemies.length == 0){
                res.send('No enemies yet!');
                return;
            }else if(player.enemies.length == 1){
                enemyIndex = 0;
            }else{
                enemyIndex = Math.floor((Math.random()*1000000)+1)%player.enemies.length;
            }



            var enemy = player.enemies[enemyIndex];

            var gameIndex = -1;
            if(enemy.games.length == 0){
                res.send('No Games yet!');
                return;
            }else if(enemy.games.length == 1){
                gameIndex = 0;
            }else{
                gameIndex = Math.floor((Math.random()*1000000)+1)%enemy.games.length;
            }



            var game = enemy.games[gameIndex];

            var random = Math.floor((Math.random()*100)+1);

            var itemsId = -1;

            if(random<=50){
                itemsId = game.playerItems;
            }else{
                itemsId = game.enemyItems;
            }

            models.ItemManager.findById(itemsId,{}, common.userId('MASTER'), function(err, itemManager){

                if(err){
                    next(new app.UnexpectedError(err));
                    return;
                }

                if(!itemManager){
                    next(new app.UnexpectedError("ItemManager is null"));
                    return;
                }

                var itemIndex = Math.floor((Math.random()*1000000)+1)%itemManager.items.length;

                var item = itemManager.items[itemIndex];

                item.itemCount = item.itemCount == 0 ? 1 : 0;

                itemManager.save(common.userId('MASTER'), function(err){

                    if(err){
                        next(new app.UnexpectedError(err));
                        return;
                    }

                    res.send(item);

                });

            });





        });

    });

});