// game.js Update 4
const RUDE_LIST = [
{id:"stone",name:"Камень",value:1,rate:0.5},
{id:"coal",name:"Уголь",value:3,rate:0.3},
{id:"iron",name:"Железо",value:8,rate:0.15},
{id:"gold",name:"Золото",value:15,rate:0.05},
{id:"diamond",name:"Алмаз",value:40,rate:0.01}
];

const MONSTERS = [
{name:"Пещерный медведь", health:50, damage:10},
{name:"Паук", health:30, damage:5}
];

const PICKAXE_LIST=[
{id:"wood",name:"Деревянная кирка",power:1,price:0},
{id:"stone",name:"Каменная кирка",power:1.5,price:50},
{id:"iron",name:"Железная кирка",power:2,price:150},
{id:"gold",name:"Золотая кирка",power:3,price:400},
{id:"diamond",name:"Алмазная кирка",power:5,price:1000}
];

let state = {
  balance:0,
  inventory:{},
  pickaxeIndex:0,
  energy:20,
  maxEnergy:20,
  mining:false,
  timer:0,
  health:100,
  attack:10
};

let currentMonster = null;

function saveState(){localStorage.setItem('minegame_adv',JSON.stringify(state));document.getElementById('saveState').innerText='Автоматически (сохранено)';}
function loadState(){const s=localStorage.getItem('minegame_adv');if(s) state=JSON.parse(s);}
function updateUI(){
  document.getElementById('balance').innerText='Монет: '+Math.round(state.balance);
  document.getElementById('pickaxe').innerText='Кирка: '+PICKAXE_LIST[state.pickaxeIndex].name;
  document.getElementById('energy').innerText='Энергия: '+state.energy+'/'+state.maxEnergy;
  document.getElementById('playerHealth').innerText='Здоровье: '+state.health+'/100';
  const inv=document.getElementById('inventoryList'); inv.innerHTML='';
  RUDE_LIST.forEach(r=>{const cnt=state.inventory[r.id]||0; const el=document.createElement('div'); el.innerText=r.name+' × '+cnt; inv.appendChild(el);});
}

function addLog(msg){const log=document.getElementById('eventLog');log.innerHTML=msg+'<br>'+log.innerHTML;}

function chooseOre(){const r=Math.random(); let sum=0; for(const ore of RUDE_LIST){sum+=ore.rate;if(r<=sum) return ore;} return RUDE_LIST[0];}

function startCombat(monster){
  currentMonster = {...monster};
  document.getElementById('combat').style.display='block';
  document.getElementById('monsterInfo').innerText = `Монстр: ${currentMonster.name}, HP: ${currentMonster.health}`;
}

function attackMonster(){
  if(!currentMonster) return;
  let ratioPlayer = state.health / currentMonster.damage;
  let ratioMonster = currentMonster.health / state.attack;
  if(ratioMonster < ratioPlayer){
    let damageTaken = Math.ceil(currentMonster.health/state.attack*currentMonster.damage);
    state.health -= damageTaken;
    if(state.health < 0) state.health = 0;
    addLog(`Вы победили ${currentMonster.name}, получили урон ${damageTaken}`);
  } else {
    state.health = 0;
    addLog(`Вы проиграли бой с ${currentMonster.name} и погибли!`);
    alert('Вы умерли! Игра начинается заново.');
    state = {balance:0,inventory:{},pickaxeIndex:0,energy:20,maxEnergy:20,mining:false,timer:0,health:100,attack:10};
  }
  currentMonster = null;
  document.getElementById('combat').style.display='none';
  updateUI();
  saveState();
}

function runFromMonster(){
  if(currentMonster){
    addLog(`Вы убежали от ${currentMonster.name}!`);
    currentMonster = null;
    document.getElementById('combat').style.display='none';
  }
}

function tickMining(){
  if(state.timer>0){state.timer--;document.getElementById('timer').innerText='Время копки: '+state.timer; return;}
  state.mining=false;document.getElementById('timer').innerText='Время копки: 0';
  const pick=PICKAXE_LIST[state.pickaxeIndex];
  const amount=Math.floor(pick.power+Math.random()*2);
  const ore=chooseOre();
  state.inventory[ore.id]=(state.inventory[ore.id]||0)+amount;
  addLog('Добыто '+amount+'× '+ore.name);
  // увеличенный шанс появления монстра 20%
  if(Math.random()<0.2){
    const monster = MONSTERS[Math.floor(Math.random()*MONSTERS.length)];
    startCombat(monster);
  }
  saveState(); updateUI();
}

function dig(){if(state.mining){addLog('Копка уже идет!'); return;}
if(state.energy<1){addLog('Недостаточно энергии для копки'); return;}
state.energy--; state.mining=true; state.timer=Math.max(3,5-PICKAXE_LIST[state.pickaxeIndex].power); document.getElementById('timer').innerText='Время копки: '+state.timer; addLog('Начата копка...');}

function sell(){let total=0;for(const r of RUDE_LIST){const cnt=state.inventory[r.id]||0; total+=cnt*r.value; state.inventory[r.id]=0;} if(total>0){state.balance+=total; addLog('Продано на '+total+'💰');} else addLog('Нечего продавать.'); saveState(); updateUI();}

function init(){
  loadState(); RUDE_LIST.forEach(r=>{if(!state.inventory[r.id]) state.inventory[r.id]=0;});
  document.getElementById('digBtn').addEventListener('click',dig);
  document.getElementById('sellBtn').addEventListener('click',sell);
  document.getElementById('attackBtn').addEventListener('click',attackMonster);
  document.getElementById('runBtn').addEventListener('click',runFromMonster);
  setInterval(()=>{if(state.mining)tickMining();},1000);
  setInterval(()=>{if(state.energy<state.maxEnergy){state.energy++; updateUI();}},60000);
  updateUI(); addLog('Игра загружена.');
  saveState();
}

window.addEventListener('load',init);
