const $ = document.querySelector.bind(document);
      const $$ = document.querySelectorAll.bind(document); 
      
      const PLAYER_STORAGE_KEY = 'F8_Player';

      const heading = $('header h2');
      const cdThumb = $('.cd-thumb');
      const audio = $('#audio'); 
      const cd = $('.cd');
      const playBtn = $('.btn-toggle-play'); 
      const player = $('.player');
      const playList = $('.playlist');
      const progress = $('#progress');
      const preBtn = $('.btn-prev');
      const nextBtn = $('.btn-next');
      const randomBtn = $('.btn-random');
      const repeatBtn = $('.btn-repeat');
      const app = { 
        currentIndex: 0,
        isPlaying: false,
        isRandom: false,
        isRepeat: false,
        config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
        songs: [ 
        {
          name: 'Ai moi la ke xau xa',
          singer: 'MCK',
          path: './assets/music/song1.mp3',
          image: './assets/image/song.webp',
        },
        {
          name: 'Anh da on hon',
          singer: 'MCK',
          path: './assets/music/song2.mp3',
          image: './assets/image/song.webp',
        },
        {
          name: 'Bad trip',
          singer: 'MCK',
          path: './assets/music/song3.mp3',
          image: './assets/image/song.webp',
        },
        {
          name: 'Cuon cho anh mot dieu nua di',
          singer: 'MCK',
          path: './assets/music/song4.mp3',
          image: './assets/image/song.webp',
        },
        {
          name: 'Show me love',
          singer: 'MCK',
          path: './assets/music/song5.mp3',
          image: './assets/image/song.webp',
        },
        {
          name: 'Suit & Tie',
          singer: 'MCK',
          path: './assets/music/song6.mp3',
          image: './assets/image/song.webp',
        },
        {
          name: 'Tai vi sao',
          singer: 'MCK',
          path: './assets/music/song7.mp3',
          image: './assets/image/song.webp',
        },
        {
          name: 'Toi nay ta di dau nho',
          singer: 'MCK',
          path: './assets/music/song8.mp3',
          image: './assets/image/song.webp',
        }
      ],
        setConfig: function(key, value) {
          this.config[key] = value;
          localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config));
        },
        render: function() {
          const htmls = this.songs.map((song, index) => {
            return `
          <div class="song  ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb" style="background-image: url(' ${song.image}')">
            </div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
          </div>
            `
          })
          playList.innerHTML = htmls.join('');
        },
        defineProperties: function() {
          Object.defineProperty(this, 'currentSong', {
            get:function() {
              return this.songs[this.currentIndex];
            }
        })
       },
        handleEvents: function() {
            const _this = this;
            const cdWidth = cd.offsetWidth;
            // Xu li khi quay/dung cd
            const cdThumbAnimate = cdThumb.animate([
              {
                transform: 'rotate(360deg)'
              }], 
              {
                duration:10000,
                iterations: Infinity
              })
            cdThumbAnimate.pause();

            // xu li phong to / thu nho cd
          document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newcdWidth = cdWidth - scrollTop;

            cd.style.width = newcdWidth > 0 ? newcdWidth + 'px' : 0;
            cd.style.opacity  = newcdWidth / cdWidth;
          }

            // Xu li khi play
            playBtn.onclick = function() {
              if (_this.isPlaying) {  
                audio.pause();
              }
              else {
                audio.play();
              }
            }
            // Khi song duoc play
            audio.onplay = function() {
              _this.isPlaying = true;
              player.classList.add('playing');
              cdThumbAnimate.play();
            }
            // Khi song duoc pause
            audio.onpause = function() {
              _this.isPlaying = false;
              player.classList.remove('playing');
              cdThumbAnimate.pause();
            }
            // Khi tien do bai hat thay doi
            audio.ontimeupdate = function() {
              if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                console.log(progressPercent);
                progress.value = progressPercent;
              }
            }
            progress.onchange = function(e) {
              const seekTime = e.target.value * audio.duration /100;
              audio.currentTime = seekTime;
            }
            // Khi next bai
            nextBtn.onclick = function() {
              if (_this.isRandom) {
              _this.playRandomSong();
            }
            else {
              _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
            }
            // Khi prev bai
            preBtn.onclick = function() {
            if (_this.isRandom) {
              _this.playRandomSong();
            }
            else {
              _this.preSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
            }
            // bat/tat Random bai hat
            randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
            // nếu _this.isRandom là true thì sẽ xóa active và ngược lại
            }
            //  xu li next song khi audio ended
            audio.onended = function() {
              if (_this.isRepeat) {
                audio.play();
              }
              else {
                nextBtn.click();
              }
            }
            // Xu li khi repeat bai hat
            repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
            }
            // Lang nghe hanh vi click vao playlist
            playList.onclick = function(e) {
              const songNode = e.target.closest('.song:not(.active)');
               
              if (songNode || e.target.closest('.option')) {
                if (songNode) {
                  _this.currentIndex = Number(songNode.dataset.index);
                  _this.loadCurrentSong();
                  _this.render();
                  audio.play();
              }
              }
            }
        },
        //  Khi next song
        loadConfig: function() {
          this.isRandom = this.config.isRandom;
          this.isRepeat = this.config.isRepeat;
        },
        loadCurrentSong: function() {
          heading.textContent = this.currentSong.name;
          cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
          audio.src = this.currentSong.path;
        },
        nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
          this.currentIndex = 0;
          }
        this.loadCurrentSong();
        },
        preSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
          this.currentIndex = this.songs.length-1;
        }
        this.loadCurrentSong();
        },
        playRandomSong: function() {
          let newIndex ;
          do {
            newIndex = Math.floor(Math.random()*this.songs.length);
          }
          while (newIndex === this.currentIndex)
          this.currentIndex = newIndex;
          this.loadCurrentSong();
        },
        scrollToActiveSong: function() {
          setTimeout(() => {
            $('.song.active').scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }, 300);
        },
        start: function() {
          // gan cau hinh tu config vao ung dung
          this.loadConfig();
          // Dinh nghia cac thuoc tinh cho object
            this.defineProperties();
          // Lang nghe/ xu li cac su kien Dom EVENTS
            this.handleEvents();
          // Tai thong tin bai hat dau tien vao UI khi chay ung dung
          this.loadCurrentSong();
          // Render Playlist
            this.render();
          //  Hien thi trang thai ban dau cua button repeat va random
          randomBtn.classList.toggle('active', this.isRandom);
          repeatBtn.classList.toggle('active', this.isRepeat);
        }
    }
    app.start();