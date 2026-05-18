// Scene(컴포넌트) 파일 불러오기
import { MainScene } from './scenes/MainScene.js';

// 우클릭 시 툴팁 출력으로 인한 오류 방지를 위해 우클릭 이벤트 비활성화
document.oncontextmenu = function (e) { return false; }

// 게임 엔진 설정
const config = {
    type: Phaser.AUTO,
    width: 1280, // 너비 1280px
    height: 720, // 높이 720px
    transparent: true, // 캔버스 배경을 투명하게 설정
    parent: 'game-container',
    scene: [MainScene], // 불러온 Scene 등록
    scale: {
        mode: Phaser.Scale.PIT, // 디바이스 화면에 맞게 비율 조정
        autoCenter: Phaser.Scale.CENTER_BOTH, // 화면 중앙 정렬
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    }
};

// 게임 활성화
new Phaser.Game(config);
