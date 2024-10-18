'use strict';
//じゃんけん用のSCRIPTを書いてください

const GU = 1;
const CHOKI = 2;
const PA = 3;
const guImg = '<img src="img/gu.png" width="50">';
const choImg = '<img src="img/choki.png" width="50">';
const paImg = '<img src="img/pa.png" width="50">';
const guImg_L = '<img src="img/gu.png" width="250">';
const choImg_L = '<img src="img/choki.png" width="250">';
const paImg_L = '<img src="img/pa.png" width="250">';
const $startBtn = $("#start_btn");
const $guBtn = $("#gu_btn");
const $choBtn = $("#cho_btn");
const $paBtn = $('#par_btn');
const $judgment = $('#judgment');
// const judge = "";
const $yourHands = $('#your_hands');
const $pcHands = $('#pc_hands');
const evenMsg = '<h2>あいこ</h2>';
const loseMsg = '<h2>まけ</h2>';
const winMsg = '<h2>かち</h2>';
const clearMsg = '<h2></h2>';
const guchopaImg = '<img src="img/guchopa.gif" width="150">';
const junkenponSound = $("#junkenponSound").get(0);
const winSound = $("#winSound").get(0);
const loseSound = $("#loseSound").get(0);
const evenSound = $("#evenSound").get(0);
let winCount = 0;
const $multi02 = $("#multi02");
const $multi04 = $("#multi04");
const $multi08 = $("#multi08");
const $multi16 = $("#multi16");
const $multi32 = $("#multi32");
const $multiAll = $(".multi");
const $medalnum = $("#medalnum");
let medal = 0;
let audio;
const $tenYenInsert = $("#tenYenInsert");
const $hundredYenInsert = $("#hundredYenInsert");
const $medalSet = $("#medalSet");
const $medalGet = $("#medalGet");
const $document = $(document);
let audiAble = false;
let $sound = $(".sound");
let isGuChokiPaAble = false;
let isStartAble = true;
let isGaming = false;
const S_KEY = 83; //キーコード
const G_KEY = 71; //キーコード
const K_KEY = 75; //キーコード
const P_KEY = 80; //キーコード
const $body = $("body");
const BG_IMG = 'background-image';
const urlNone = 'none';
const urlLittle = 'url(img/raining-money-26.gif)';
const urlMany = 'url(img/raining-money-12.gif)';
const urlLose = 'url(img/lose.png)';
const BG_COLOR = "background-color";
const DEFALT_BG_CLR = "#f0e68c"; 
const INIT_BTN_CLR = "#c3f2ff";
const PUSH_BTN_CLR = "#0066CC";
const INIT_MULTI_CLR = "#ffcaca";
const APPLY_MULTI_CLR = "#f98fab";
const BUY_MEDAL_MESSAGE = "メダルを購入してください";
const COOKIE_NAME = '01_guy_janken';

$document.ready(function() {
  guchopaDisable();
  btnHideControl();
  audio = junkenponSound;
  // audioStop();
  medalInfo();
  bgGifDisplay(urlLittle);

  $tenYenInsert.on("click",function(){
    if(isGaming) return;
    medalPayment(1);
  });
  $hundredYenInsert.on("click",function(){
    if(isGaming) return;
    medalPayment(10);
  });

  $medalSet.on("click",function(){
    if(isGaming) return;
    setCookie();
    medal = 0;
    medalInfo();
  });
  $medalGet.on("click",function(){
    if(isGaming) return;
    medal += getCookie()||0;
    deleteGookie();
    medalInfo();
  });



  $startBtn.on("click",function(){
    if(isGaming) return;
    startFunction();
  });

  $guBtn.on("click",function(){
    jankenGame(GU);
  });



  $choBtn.on("click",function(){
    jankenGame(CHOKI);
  });


  $paBtn.on("click",function(){
    jankenGame(PA);
  });


  $document.keydown(function (e) {
    const key = e.keyCode;
    if(key == S_KEY){
      startFunction();
    }
    if(key === G_KEY){
      if(!isGuChokiPaAble) return;
      jankenGame(GU);
    }
    if(key === K_KEY){
      if(!isGuChokiPaAble) return;
      jankenGame(CHOKI);
    }
    if(key === P_KEY){
      if(!isGuChokiPaAble) return;
      jankenGame(PA);
    }
  });


  function startFunction(){
    if(isGaming) return;
    if(!isPlayAble()) return;
    startDisable();
    medalConsumption();
    initStatus();
    animateBtn($startBtn);
    audio = junkenponSound;
    audio.load();
    audio.play();
    // console.log('sound');
    guchopaRoundFunction();
    clearBtn();
    guchopaEnable();
    btnShowControl();
    bgGifDisplay();
    isGaming = true;
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
    // yourHand = dashite;
    const handMap = {
      [GU]: { img: guImg, $btn: $guBtn },
      [CHOKI]: { img: choImg, $btn: $choBtn },
      [PA]: { img: paImg, $btn: $paBtn },
    }; 
    const { img, $btn } = handMap[yourHand];

    clearBtn();
    $btn.css("background", PUSH_BTN_CLR);
    $yourHands.html(img);
    pcJunken();
    audio.pause();
    judgement(yourHand,pcJunken());
    medalInfo();
  }


  function clearBtn() {
    $guBtn.css("background",INIT_BTN_CLR);
    $choBtn.css("background",INIT_BTN_CLR);
    $paBtn.css("background",INIT_BTN_CLR);
  }

  function pcJunken() {
    //PCのじゃんけん
    let pchand = Math.ceil(Math.random() * 3);

    if(pchand === GU) $pcHands.html(guImg_L); 
    if(pchand === CHOKI) $pcHands.html(choImg_L);
    if(pchand === PA) $pcHands.html(paImg_L);
    return pchand;
  }

  function judgement(yourHand, pcHand) {
    //勝ちパターン
    if((yourHand === GU && pcHand === CHOKI)||(yourHand === CHOKI && pcHand === PA)||(yourHand === PA && pcHand === GU)){
      audio = winSound;
      audio.load();
      audio.play();
      $judgment.html(winMsg);
      btnHideControl(yourHand);
      winCount += 1;
      multiDisplay();
      setTimeout(() =>{
        isGaming = false;
        startEnable();
      } ,1000);
    }

    //負けパターン
    if((pcHand === GU && yourHand === CHOKI)||(pcHand === CHOKI && yourHand === PA)||(pcHand === PA && yourHand===GU)){
      $judgment.html(loseMsg);
      // audio.currentTime = 0;
      audio = loseSound;
      audio.load();
      audio.play();
      btnHideControl(yourHand);
      // guchopaDisable();
      multiClear();
      bgGifDisplay(urlLose);
      setTimeout(() =>{
        isGaming = false;
        startEnable();
      } ,1000);
    }
    //あいこパターン イコール
    if(yourHand === pcHand) {
      $judgment.html(evenMsg);
      // audio.currentTime = 0;
      audio = evenSound;
      audio.load();
      audio.play();
      // startDisable();
      setTimeout(()=>{
        guchopaRoundFunction();
        guchopaEnable();
      }, 600);
    }

  }

  function guchopaRoundFunction() {
      $pcHands.html(guchopaImg);
    }

  function guchopaDisable(){
    $("#gu_btn, #cho_btn, #par_btn").prop("disabled", true);
    isGuChokiPaAble = false;
    // console.log('guchopaDisable');
  }
  
  function guchopaEnable(){
    $("#gu_btn, #cho_btn, #par_btn").prop("disabled", false);
    isGuChokiPaAble = true;
    // console.log('guchopaEnable');
  }



  function btnHideControl(yourHand=0) {
    
    if(yourHand === GU){
      $("#cho_btn, #par_btn").hide();
    } 
    if(yourHand === CHOKI){
      $("#gu_btn,#par_btn").hide();
    } 
    if(yourHand === PA){
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
    isStartAble = false;
    // console.log('startDisable');
  }
  
  function startEnable(){
    $("#start_btn").prop("disabled", false);
    isStartAble = true;
    // bgGifDisplay(BG_NONE);
    // console.log('startEnable');
  }

  function initStatus() {
    // pcHand = 0;
    // yourHand = 0;
    $yourHands.html(clearMsg);
    $judgment.html(clearMsg);
    medalInfo();
    bgGifDisplay();
  }


  
  function multiDisplay() {
    const multiMap = {
    [1]: { $disp: $multi02, medal: 2, img: urlLittle },
    [2]: { $disp: $multi04, medal: 4, img: urlLittle },
    [3]: { $disp: $multi08, medal: 8, img: urlLittle },
    [4]: { $disp: $multi16, medal: 16, img: urlMany },
    [5]: { $disp: $multi32, medal: 32, img: urlMany },
    };

    const { $disp, medal, img } = multiMap[winCount];
    $multiAll.css(BG_COLOR,INIT_MULTI_CLR);
    $disp.css(BG_COLOR,APPLY_MULTI_CLR);
    medalPayment(medal);
    bgGifDisplay(img);
    if(winCount===5) ending();
  }

  function bgGifDisplay(imgURL){
    $body.css(BG_IMG,imgURL||urlNone);

  }

  function multiClear() {
    winCount = 0;
    $multiAll.css(BG_COLOR,INIT_MULTI_CLR);
  }

  function ending() {
    winCount = 0;
    // なんかムービー
  }

  function medalPayment(num) {
    medal += num;
    medalInfo();
  }

  function medalConsumption() {
    medal -= 1;
    medalInfo();
    // console.log('medalConsumption()');
  }

  function medalInfo() {
    $medalnum.html('<h4>' + medal + '</h4>');
  }

  function isPlayAble() {
    if(medal > 0){
      return true;
    } else {
      alert(BUY_MEDAL_MESSAGE);
      return false;
    }
  }

  function setCookie(){
    $.cookie(COOKIE_NAME,medal);
  }
  function getCookie(){
    return Number($.cookie(COOKIE_NAME));
  }
  function deleteGookie(){
    $.removeCookie(COOKIE_NAME);
  }

});

