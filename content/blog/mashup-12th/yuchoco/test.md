---
title: "매쉬업 안드로이드 블로그 만들기와 그 후기"
date: "2022-04-28"
tags: ["start", "mash-up", "chocopie", "blog"]
description: "매시업 안둥이 고인물이 쓰는 글입니다 ㅎㅎ"
cover: "./images/ic_android.png"
---

> 오늘 목차

위의 정해둔 양식, 즉 아래 코드블럭 안에 들어간 양식은 반드시 지켜야 해요!ㅎㅎ 안그러면 다이,,
~~~
---
title: "제목입력"
date: "2020-12-03"
tags: ["start", "mash-up", "chocopie"] // #키워드 작성하기!
description: "미리보기글"
cover: "./ic_android.png"
---

> 소개글

#ㅎㅏ하하

일반 글쓰기
~~~

그리고 `cover` 에 커버이미지를 올리게 되는데 저는 지금 'mashup-12th/yuchoco/test.md' 파일에서 작업중이고 저기 저  "./ic_android.png" 이미지는 'mashup-12th/yuchoco/ic_android.png' 속에 들어있어요 ㅎㅎ 
만약 `http://~~~` 로 된 이미지 url 로 올리고 싶은 사람이 있을텐데 아쉽지만 사진이 이 블로그글과 함께 올라가야해요 ㅎㅎ.. 그래서 본인의 이름(별칭)을 딴 폴더를 생성해 요리조리 넣어주세요!

> 그거 아시나요? .png 와 .jpg의 차이인데요! 단순히 보면 jpg의 사이즈가 같은 해상도임에도 불과하고 엄청 작아요!
왜냐하면 png 확장자는 투명도를 가지고 있기 때문에 (배경이 투명한 이미지 뽑을 때 유용하죠!) 용량이 상대적으로 크고 jpg(jpeg)의 경우 투명한 이미지를 생성할 수 없고 그대신 용량이 훠어얼- 작아요,,ㅎㅎ~~,,, 그냥 주저리주저리 주접이엿습니다~ 이렇게 글을 쓰고 나면 저장을 하고 commit 을 남기겠죠~?

commit을 남기기 전에 "feature/yuchoco-글제목" 라는 브랜치를 생성해서 이동을 합니다! 
그리고 이 때 남기는 커밋메세지의 규칙이 하나 있어요!

~~~
docs: feature/yuchoco-글제목

- 오늘은 블로그를 만들고 그동안의 느낀점과 우리 안둥이들이 어떻게 글을 써왔는지 적어보았습니다!

Fixed #issueNum
~~~

이런식으로 글을 작성했기 때문에 커밋메세지의 타이틀에 docs 를 명시해줍니다! 그리고 글을 올린다고 바로 `dev` 브랜치에 냅다 합치는게 아닌
pull-request(PR) 을 보내서 내 글에 오타가 없는지~ 더 좋은 내용이 있다면 서로 피드백도 해주고!! 
그리고 제일 중요한 내가 추가한 글이 무사히 배포 되는지! 를 확인할 수 있게 됩니다 ㅎㅎ
![pr_check](./images/pr_check.png)

그래서 PR을 올리고 틀린 부분이 있으면 고쳐서 동일 브랜치에 다시 push 하구요..
그리고 무엇이 틀렸나 원인도 모를 땐 저를 찾아주시면 됩니다...(choco.초코촠,, 촠촠박사,,,)
그동안 올라온 pr들 전부 맞춤법 검사기 돌려서 오타 찾아주고 ㅎㅎ 이미지 리사이징 도와주고 뭐 제가 그런거 하고 있어요~~ 캬캬

자자, 이제 위와같은 과정을 거쳤으면 이제 머지 해도 되나요?
라고 할때....!! 호락호락하지 않음을 또 느끼며..ㅎㅎ 누군가의 aprove는 받아야 셀프 머지할 맛이 나죠!!
그래서 이제 진짜 머지하나..? (두근) 할 때 ㅎㅎㅎ 
hoxy~~라도~~~ rebase merge 하려는데 안될 때.. 충돌이 날 때 ㅜㅜ
내 앞에 다른사람이 이미 자신이 작업한걸 `dev` 브랜치에 합쳐놓고 뭔지는 모르지만 서로 같은걸 수정 했을 때 (이런일이 없게끔 각자 폴더 생성해서 거기서만 놀아요)
본인 터미널 들어가서 `dev` 브랜치에서 `git pull upstream dev --rebase` 하고 다시 `feature/yuchoco-글제목` 브랜치에 가서 `git rebase dev` 를 치면 앞서 작업한 내용들이 들어오겠죠..? 들어올거에요 아마 ㅎㅎ

그렇게 rebase merge 할 준비고 되고 드디어,,, 합치면 넘넘 설레겠죠 ㅎㅎ

위에서 upstream 을 이야기 했는데, 왜 origin 이 아니라 upstream 인거죠? 라고 한다면 
처음 진행할 때 설명은 하겠지만 A- "https://github.com/YuChocopie/mashup-android"을 fork 뜨면 B- "https://github.com/내계정/mashup-android" 이라는게 생기겠죠? 이 때 A 는 upstream B는 downstream 으로 설정해줍니다!
~~~
git remote add upstream https://github.com/YuChocopie/mashup-android
git remote add downstream https://github.com/내계정/mashup-android
~~~

이렇게 하는 이유는 내 작업은 안전하게 downstream에서 하고! 내가 작업한, 실제 배포된 블로그에 쓰고싶은 글을 담은 pr을 upstrem에 보내는 것이에요 ㅎㅎ
그래서 아래와 같이 pr을 생성하게 되는거죠.. 하하
`내계정/mashup-android 의 feature/yuchoco-글제목` -> `yuchoco/mashup-android 의 dev`
저도 지금 글로 적다보니 이해가 갈까 내가 잘 설명하는걸까 걱정이되지만..
원래 이러면서 나아지는 거겠죠? 오늘도 잠을 못자 피곤해요 @_@
여기서 잠깐 끊었다가 이어서 해야겠어요~ 다만, 저희 신입 안둥이분들의 글들이 모두 올라온다면 스르륵- 지우거나 글을 다시 다듬기 위해 숨기겠조~? ㅎㅎ
여기서 잠시 쉬어갈게용 안뇽~