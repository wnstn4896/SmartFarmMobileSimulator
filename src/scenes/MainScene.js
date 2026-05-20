// Phaser.js 프레임워크의 내장 클래스를 상속받아 게임 시스템을 구성하는 Scene(컴포넌트와 비슷한 개념) 클래스
export class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });

        // 화면에 생성된 작물 스프라이트들을 추적하고 지우기 위한 배열
        this.currentPlantSprites = [];

        // 안드로이드에서 넘어온 한글 이름을 이미지 스프라이트 키값으로 매핑하는 딕셔너리
        this.plantKeyMap = {
            '감자': 'potato', '당근': 'carrot', '토마토': 'tomato',
            '양배추': 'cabbage', '가지': 'eggplant', '호박': 'pumpkin',
            '마늘': 'garlic', '양파': 'onion', '파프리카': 'paprika',
            '브로콜리': 'broccoli'
        };
    }

    // 리소스를 불러와 로드하는 메서드
    preload() {
        // 이미지 파일 경로 입력 단축을 위해 변수로 미리 그룹화
        const basePath = window.location.pathname.replace(/\/[^\/]*$/, '');
        const images = `${basePath}/images`;

        // 배경 이미지 로드
        this.load.image('background', `${images}/background.png`);
        // 각 작물 종류별 스프라이트 이미지 로드
        this.load.image('potato', `${images}/potato.png`);
        this.load.image('carrot', `${images}/carrot.png`);
        this.load.image('tomato', `${images}/tomato.png`);
        this.load.image('cabbage', `${images}/cabbage.png`);
        this.load.image('eggplant', `${images}/eggplant.png`);
        this.load.image('pumpkin', `${images}/pumpkin.png`);
        this.load.image('garlic', `${images}/garlic.png`);
        this.load.image('onion', `${images}/onion.png`);
        this.load.image('paprika', `${images}/paprika.png`);
        this.load.image('broccoli', `${images}/broccoli.png`);
    }

    // 불러온 리소스를 활용해 게임 요소를 정의하는 메서드
    create() {
        // 로드된 이미지를 배경으로 추가
        this.background = this.physics.add.sprite(640, 350, 'background');

        // 전역 윈도우 객체에서 현재 Scene 인스턴스에 접근할 수 있도록 저장
        window.mainSceneInstance = this;
    }

    // 안드로이드에서 전달받은 데이터를 처리하여 화면에 작물 스프라이트를 띄우는 메서드
    updateFarmData(plantsStr, temp, humidity, light, flag) {
        // 기존에 화면에 그려진 작물이 있다면 모두 파괴하여 겹치지 않게 초기화
        this.currentPlantSprites.forEach(sprite => sprite.destroy());
        this.currentPlantSprites = [];

        // 선택된 작물이 없을 경우 예외 처리
        if (!plantsStr) return;

        // "감자, 토마토" 형태의 문자열을 쉼표 기준으로 분리해 배열로 변환: ['감자', '토마토']
        const plantNames = plantsStr.split(', ');

        // 화면 너비 기준값
        const screenWidth = 1280; // 전체 너비
        const groundY = 360; // 작물들이 서 있을 땅의 Y 좌표
        const availableWidth = screenWidth - (margin * 2); // 실제 작물들이 배치될 수 있는 너비

        // 선택된 작물 개수만큼 반복하며 스프라이트 생성
        plantNames.forEach((name, index) => {
            const spriteKey = this.plantKeyMap[name];

            if (spriteKey) {
                // 여백(margin)에서 시작하여 균등하게 배치
                let xPos;
                if (plantNames.length === 1) {
                    xPos = screenWidth / 2; // 1개일 때는 무조건 정중앙
                } else {
                    // 2개 이상일 때는 사용 가능한 너비(availableWidth)를 나눠서 간격을 넓힘
                    const spacing = availableWidth / (plantNames.length - 1);
                    xPos = margin + (spacing * index);
                }

                // 스프라이트 생성
                let plantSprite = this.physics.add.sprite(xPos, groundY, spriteKey);

                // 스프라이트 크기 조정
                plantSprite.setScale(9);

                // 종합 상태에 따라 작물의 시각적 상태 변화 적용
                if (flag === 2) {
                    // 위험 상태: 붉은색 필터를 씌움 (물 부족, 온도 이상 등)
                    plantSprite.setTint(0xff4444);
                } else if (flag === 1) {
                    // 주의 상태: 노란색 필터를 씌움
                    plantSprite.setTint(0xffff88);
                } else {
                    // 정상 상태: 원래 색상 유지
                    plantSprite.clearTint();
                }

                // 나중에 다시 지우기 위해 배열에 저장
                this.currentPlantSprites.push(plantSprite);
            }
        });
    }
}

// HTML/브라우저 전역(window) 공간에 안드로이드가 직접 호출할 브릿지 함수
window.updateGameStatus = function (plants, temp, humidity, light, flag) {
    if (window.mainSceneInstance) {
        // Scene 내부에 만들어둔 updateFarmData 메서드로 값 전달
        window.mainSceneInstance.updateFarmData(plants, temp, humidity, light, flag);
    }
};