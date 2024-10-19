'use strict';

const HANDS = {
  GU: 1,
  CHOKI: 2,
  PA: 3, 
}

const IMAGES = {
  GU: '<img src="img/gu.png" width="50">',
  CHOKI: '<img src="img/choki.png" width="50">',
  PA: '<img src="img/pa.png" width="50">',
  GU_LARGE: '<img src="img/gu.png" width="250">',
  CHOKI_LARGE: '<img src="img/choki.png" width="250">',
  PA_LARGE: '<img src="img/pa.png" width="250">',
  GUCHOPA: '<img src="img/guchopa.gif" width="150">',
}

const MESSAGES = {
  EVEN: '<h2>あいこ</h2>',
  WIN: '<h2>かち</h2>',
  LOSE: '<h2>まけ</h2>',
  CLEAR: '<h2></h2>',
  BUY_MEDAL: "10円か100円を投入してください",
}

const SOUNDS = {
  JANKENPON:  $("#junkenponSound").get(0),
  WIN: $("#winSound").get(0),
  LOSE: $("#loseSound").get(0),
  EVEN: $("#evenSound").get(0),
}

const gameStatus = {
  winCount: 0,
  medal: 0,
  isGuChokiPaAble: false,
  isStartAble: true,
  isGaming: false,
  audio: null,
  isSoundOK: true,
}

const BACKGROUNDS = {
  NONE: 'none',
  LITTLE: 'url(img/raining-money-26.gif)',
  MANY: 'url(img/raining-money-12.gif)',
  LOSE: 'url(img/lose.png)'
};

const COLORS = {
  DEFAULT_BG: "#f0e68c",
  INIT_BTN: "#c3f2ff",
  PUSH_BTN: "#0066CC",
  INIT_MULTI: "#ffcaca",
  APPLY_MULTI: "#f98fab"
};

const KEYS = {
  S: 83,
  G: 71,
  K: 75,
  P: 80
};

// DOM elements
const $startBtn = $("#start_btn");
const $guBtn = $("#gu_btn");
const $choBtn = $("#cho_btn");
const $paBtn = $('#par_btn');
const $judgment = $('#judgment');
const $yourHands = $('#your_hands');
const $pcHands = $('#pc_hands');
const $multi02 = $("#multi02");
const $multi04 = $("#multi04");
const $multi08 = $("#multi08");
const $multi16 = $("#multi16");
const $multi32 = $("#multi32");
const $multiAll = $(".multi");
const $medalnum = $("#medalnum");
const $tenYenInsert = $("#tenYenInsert");
const $hundredYenInsert = $("#hundredYenInsert");
const $medalSet = $("#medalSet");
const $medalGet = $("#medalGet");
const $document = $(document);
let $sound = $(".sound");
const $body = $("body");
const BG_IMG = 'background-image';
const BG_COLOR = "background-color";
const COOKIE_NAME = '01_guy_janken';

$document.ready(function() {
  initializeGame();
  attachEnevntListners();
});

function initializeGame() {
  guchopaDisable();
  btnHideControl();
  gameStatus.audio = SOUNDS.JANKENPON;
  // audioStop();
  updateMedalInfo();
  bgGifDisplay(BACKGROUNDS.LITTLE);
}

function attachEnevntListners(){
  $startBtn.on("click",startGame);
  $guBtn.on("click",()=>{jankenGame(HANDS.GU)});
  $choBtn.on("click",()=>{jankenGame(HANDS.CHOKI)});
  $paBtn.on("click",()=>{jankenGame(HANDS.PA)});
  $tenYenInsert.on("click", () => insertCoins(1));
  $hundredYenInsert.on("click", () => insertCoins(10));
  $medalSet.on("click", setMedalCookie);
  $medalGet.on("click", getMedalFromCookie);

  $document.keydown(handleKeyPress);
}

function insertCoins(num) {
  if(gameStatus.isGaming) return;
  medalPayment(num);
}

function setMedalCookie(){
  if(gameStatus.isGaming) return;
  setCookie();
  gameStatus.medal = 0;
  updateMedalInfo();
}

function getMedalFromCookie(){
  if(gameStatus.isGaming) return;
  gameStatus.medal += getCookie()||0;
  deleteGookie();
  updateMedalInfo();
}

function handleKeyPress(e){
  const keyHandlers = {
    [KEYS.S]: startGame,
    [KEYS.G]: ()=> gameStatus.isGuChokiPaAble && jankenGame(HANDS.GU),
    [KEYS.K]: ()=> gameStatus.isGuChokiPaAble && jankenGame(HANDS.CHOKI),
    [KEYS.P]: ()=> gameStatus.isGuChokiPaAble && jankenGame(HANDS.PA),
  }

  const hadler = keyHandlers[e.keyCode];
  if(hadler) hadler();
}

function startGame(){
  if(gameStatus.isGaming) return;
  if(!isPlayAble()) return;
  startDisable();
  medalConsumption();
  initStatus();
  animateBtn($startBtn);
  playSound(SOUNDS.JANKENPON);
  guchopaRoundFunction();
  clearBtn();
  guchopaEnable();
  btnShowControl();
  bgGifDisplay();
  gameStatus.isGaming = true;
}

function playSound(sound) {
  if(!gameStatus.isSoundOK) return;
  gameStatus.audio = sound;
  gameStatus.audio.load();
  gameStatus.audio.play();
}

function animateBtn($btn) {
  $btn.animate({width: "90px"}, 100)
    .promise().done(function() {
      setTimeout(() => {
        $btn.animate({width: "105px"}, 100);
      }, 100);
    });
}



function jankenGame(yourHand) {
  guchopaDisable();
  const handMap = {
    [HANDS.GU]: { img: IMAGES.GU, $btn: $guBtn },
    [HANDS.CHOKI]: { img: IMAGES.CHOKI, $btn: $choBtn },
    [HANDS.PA]: { img: IMAGES.PA, $btn: $paBtn },
  }; 
  const { img, $btn } = handMap[yourHand];

  clearBtn();
  $btn.css("background", COLORS.PUSH_BTN);
  $yourHands.html(img);
  gameStatus.audio.pause();
  judgementHandle(yourHand,pcJanken());
  updateMedalInfo();
}



function clearBtn() {
  $guBtn.css("background",COLORS.INIT_BTN);
  $choBtn.css("background",COLORS.INIT_BTN);
  $paBtn.css("background",COLORS.INIT_BTN);
}

function pcJanken() {
  //PCのじゃんけん
  let pchand = Math.ceil(Math.random() * 3);
  
  if(pchand === HANDS.GU) $pcHands.html(IMAGES.GU_LARGE); 
  if(pchand === HANDS.CHOKI) $pcHands.html(IMAGES.CHOKI_LARGE);
  if(pchand === HANDS.PA) $pcHands.html(IMAGES.PA_LARGE);
  return pchand;
}


function judgementHandle(yourHand, pcHand){
  const result = getGameResult(yourHand,pcHand);
  if(result === 'WIN') winHandle(yourHand);
  if(result === 'LOSE') loseHandle(yourHand);
  if(result === 'EVEN') evenHandle();
}

function getGameResult(yourHand, pcHand) {
  if(yourHand === pcHand) return 'EVEN';
  if(yourHand === HANDS.GU && pcHand === HANDS.CHOKI||yourHand === HANDS.CHOKI && pcHand === HANDS.PA||yourHand === HANDS.PA && pcHand === HANDS.GU) {
    return 'WIN';
  }
  return 'LOSE';
}

function winHandle(yourHand){
  playSound(SOUNDS.WIN);
  $judgment.html(MESSAGES.WIN);
  btnHideControl(yourHand);
  gameStatus.winCount++;
  multiDisplay();
  setTimeout(() =>{
    gameStatus.isGaming = false;
    startEnable();
  } ,1000);
}

function loseHandle(yourHand){
  $judgment.html(MESSAGES.LOSE);
  playSound(SOUNDS.LOSE);
  btnHideControl(yourHand);
  multiClear();
  bgGifDisplay(BACKGROUNDS.LOSE);
  setTimeout(() =>{
    gameStatus.isGaming = false;
    startEnable();
  } ,1000);
}

function evenHandle(){
  $judgment.html(MESSAGES.EVEN);
  playSound(SOUNDS.EVEN);
  // startDisable();
  setTimeout(()=>{
    guchopaRoundFunction();
    guchopaEnable();
  }, 600);
}

function guchopaRoundFunction() {
  $pcHands.html(IMAGES.GUCHOPA);
  }

function guchopaDisable(){
  $("#gu_btn, #cho_btn, #par_btn").prop("disabled", true);
  gameStatus.isGuChokiPaAble = false;
  // console.log('guchopaDisable');
}

function guchopaEnable(){
  $("#gu_btn, #cho_btn, #par_btn").prop("disabled", false);
  gameStatus.isGuChokiPaAble = true;
  // console.log('guchopaEnable');
}

function btnHideControl(yourHand=0) {
  
  if(yourHand === HANDS.GU){
    $("#cho_btn, #par_btn").hide();
  } 
  if(yourHand === HANDS.CHOKI){
    $("#gu_btn,#par_btn").hide();
  } 
  if(yourHand === HANDS.PA){
    $("#gu_btn,#cho_btn").hide();
  } 
  if(yourHand === 0) {
    $("#gu_btn, #cho_btn, #par_btn").hide();
  }
}

function btnShowControl(){
  $("#gu_btn, #cho_btn, #par_btn").show();
}

function startDisable(){
  $("#start_btn").prop("disabled", true);
  gameStatus.isStartAble = false;
  // console.log('startDisable');
}

function startEnable(){
  $("#start_btn").prop("disabled", false);
  gameStatus.isStartAble = true;
}

function initStatus() {
  $yourHands.html(MESSAGES.CLEAR);
  $judgment.html(MESSAGES.CLEAR);
  updateMedalInfo();
  bgGifDisplay();
}



function multiDisplay() {
  const multiMap = {
  [1]: { $disp: $multi02, medal: 2, img: BACKGROUNDS.LITTLE },
  [2]: { $disp: $multi04, medal: 4, img: BACKGROUNDS.LITTLE },
  [3]: { $disp: $multi08, medal: 8, img: BACKGROUNDS.LITTLE },
  [4]: { $disp: $multi16, medal: 16, img: BACKGROUNDS.MANY },
  [5]: { $disp: $multi32, medal: 32, img: BACKGROUNDS.MANY },
  };

  const { $disp, medal, img } = multiMap[gameStatus.winCount];
  $multiAll.css(BG_COLOR,COLORS.INIT_MULTI);
  $disp.css(BG_COLOR,COLORS.APPLY_MULTI);
  medalPayment(medal);
  bgGifDisplay(img);
  if(gameStatus.winCount===5) ending();
}

function bgGifDisplay(imgURL=BACKGROUNDS.NONE){
  $body.css(BG_IMG,imgURL);
}

function multiClear() {
  gameStatus.winCount = 0;
  $multiAll.css(BG_COLOR,COLORS.INIT_MULTI);
}

function ending() {
  gameStatus.winCount = 0;
  // なんかムービー
}

function medalPayment(num) {
  gameStatus.medal += num;
  updateMedalInfo();
}

function medalConsumption() {
  gameStatus.medal -= 1;
  updateMedalInfo();
  // console.log('medalConsumption()');
}

function updateMedalInfo() {
  $medalnum.html('<h4>' + gameStatus.medal + '</h4>');
}

function isPlayAble() {
  if(gameStatus.medal > 0){
    return true;
  } else {
    alert(MESSAGES.BUY_MEDAL);
    return false;
  }
}

function setCookie(){
  $.cookie(COOKIE_NAME,gameStatus.medal);
}
function getCookie(){
  return Number($.cookie(COOKIE_NAME));
}
function deleteGookie(){
  $.removeCookie(COOKIE_NAME);
}


