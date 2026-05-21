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

        this.disaster; // 자연재해 발생 여부를 파악하기 위한 변수
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

        // 홍수, 태풍 발생 시 사용할 빗방울 텍스처 생성
        let graphics = this.add.graphics();
        graphics.fillStyle(0x88CCFF, 0.8); // 약간 투명한 하늘색
        graphics.fillRect(0, 0, 3, 15); // 3x15 픽셀 크기의 길쭉한 직사각형 빗방울
        graphics.generateTexture('raindrop', 3, 15);
        graphics.destroy(); // 텍스처를 메모리에 저장한 뒤 그래픽 객체는 파괴

        // 파티클 에미터 생성 및 초기 설정
        this.rainParticles = this.add.particles('raindrop');
        this.rainEmitter = this.rainParticles.createEmitter({
            x: { min: 0, max: 1280 }, // 화면 가로 전체 범위에서 떨어짐
            y: -20, // 화면 약간 위에서 생성되어 떨어지기 시작
            lifespan: 1500, // 빗방울 수명
            speedY: { min: 500, max: 700 }, // 떨어지는 속도
            scale: { start: 1, end: 0.5 },
            quantity: 0, // 초기값 0 (비 안 옴)
            on: false // 초기 상태 꺼짐
        });

        // 전역 윈도우 객체에서 현재 Scene 인스턴스에 접근할 수 있도록 지정
        window.mainSceneInstance = this;
    }

    // 안드로이드에서 전달받은 데이터를 처리하여 화면에 작물 스프라이트를 띄우는 메서드
    updateFarmData(plantsStr, temp, humidity, light, flag, disaster) {
        // 기존에 화면에 그려진 작물이 있다면 모두 제거하여 겹치지 않게 초기화
        this.currentPlantSprites.forEach(sprite => sprite.destroy());
        this.currentPlantSprites = [];

        // 선택된 작물이 없을 경우 예외 처리
        if (!plantsStr) return;

        // 작물 종류 문자열을 쉼표 기준으로 분리해 배열로 변환 ['감자', '토마토']
        const plantNames = plantsStr.split(', ');

        // 화면 너비 기준값
        const screenWidth = 1280; // 전체 너비
        const groundY = 360; // 작물들이 서 있을 땅의 Y 좌표

        // 선택된 작물 개수만큼 반복하며 스프라이트 생성
        plantNames.forEach((name, index) => {
            const spriteKey = this.plantKeyMap[name];

            if (spriteKey) {
                // 중심점을 기준으로 작물 간의 고정 간격을 곱하여 X 좌표 계산
                const xPos = (screenWidth / 2) + (index - (plantNames.length - 1) / 2) * 400;

                // 스프라이트 생성
                let plantSprite = this.physics.add.sprite(xPos, groundY, spriteKey);

                // 스프라이트 크기 조정
                plantSprite.setScale(10);

                // 종합 상태에 따라 작물의 시각적 상태 변화 적용
                if (flag === 2) {
                    // 위험 상태일 시 작물 스프라이트에 붉은색 필터를 씌움 
                    plantSprite.setTint(0xff4444);
                } else {
                    // 필터 제거
                    plantSprite.clearTint();
                }

                // 나중에 다시 지우기 위해 배열에 저장
                this.currentPlantSprites.push(plantSprite);
            }
        });
        // 자연재해 발생 이벤트 값에 따른 handleDisasterEffect() 메서드 실행
        this.handleDisasterEffect(disaster);
    }

    // 자연재해 이벤트 발생 시 화면 효과를 전담하는 메서드
    handleDisasterEffect(disaster) {
        // 이전에 적용된 카메라 효과 초기화
        this.cameras.main.clearTint();

        switch (disaster) {
            case 0: // 이상 없음
                break;
            case 1: // 가뭄 발생 시
                // 화면 전체에 덥고 메마른 느낌의 주황빛 필터를 씌움
                this.cameras.main.setTint(0xffaa55);
                break;
            case 2: // 홍수 발생 시
                // 화면 전체에 물에 잠긴 느낌의 푸른빛 필터를 씌움
                this.cameras.main.setTint(0x5555ff);

                // 수직으로 무겁게 쏟아지는 폭우 효과 설정
                this.rainEmitter.setSpeedX(0); // 좌우 흔들림 없음
                this.rainEmitter.setSpeedY({ min: 600, max: 800 });
                this.rainEmitter.setQuantity(15); // 한 프레임당 15방울씩 생성
                this.rainEmitter.start();
                break;
            case 3: // 태풍 발생 시
                // 10초 동안 0.01의 강도로 화면 흔들림 효과 실행
                this.cameras.main.shake(10000, 0.01);
                // 강풍에 의해 왼쪽으로 거세게 날리는 비 효과 설정
                this.rainEmitter.setSpeedX({ min: -400, max: -200 }); // 대각선으로 날림
                this.rainEmitter.setSpeedY({ min: 800, max: 1000 }); // 매우 빠른 낙하 속도
                this.rainEmitter.setQuantity(20); // 홍수보다 더 많은 빗방울
                this.rainEmitter.start();
                break;
        }
    }
}

// HTML/브라우저 전역(window) 공간에 안드로이드가 직접 호출할 브릿지 함수
window.updateGameStatus = function (plants, temp, humidity, light, flag, disaster) {
    if (window.mainSceneInstance) {
        // 클래스 내부에 만들어둔 updateFarmData 메서드로 값 전달
        window.mainSceneInstance.updateFarmData(plants, temp, humidity, light, flag, disaster);
        this.disaster = disaster;
    }
};