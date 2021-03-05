---
title: Android Advance Topic’s Interview Questions Part 9 of. N
date: "2021-02-19"
tags: ["mash-up", "Advence Interview", "Android Interview"]
description: "Android Advance Topic’s Interview Questions Part 9 of. N 내용에 대한 제 생각을 적어본 포스팅입니다."
cover: "./thumbnail_post.png"
---
---

안녕하세요. 안드로이드 10기 이진성입니다.

[Android Advance Topic's Interview Questions Part 9 of. N](https://aalishan565.medium.com/android-advance-topics-interview-questions-d7920e7be6fa)에 있는 각 질문에 대한 대답을 쓴 포스팅입니다.

1번~13번 : View Model과 관련 질문
13번~24번: Coroutine과 관련 질문

으로 구성되어 있습니다 .이번 포스팅에서는 1~13번 까지의 질문에 대해 답해보겠습니다. 저의 주관적인 생각으로 정리한 내용이므로 다른 의견이 있으신 분은 언제든 댓글 부탁드리겠습니다.

1. What is MVVM explain in detail?

MVVM은 Model, View, ViewModel로 나뉘어진 아키텍처 패턴입니다. Model에서는 데이터를 받아와 가공하는 역활을 담당하며 여기서 가공된 데이터를 ViewModel이 받아 View와 관련된 비즈니스 로직을 처리합니다. View는 ViewModel을 옵저빙하여 약한 의존관계를 형성합니다. 그래서 View와 ViewModel은 M;N 관계를 형성해 ViewModel을 재사용할 수 있도록 합니다.


2. What is the advantage of MVVM?

MVVM읜 가장 큰 장점은 관심사의 분리를 통해 책임과 역활이 구분되어 진다는 거라 생각합니다 .그리고 이러한 분리를 통해 Android Framwork와의 결합도를 낮춰 테스트 코드를 용이하게 작성할 수 있습니다.


3. How View Model survives orientation change?


4. What is the use of a Repository?

애플리케이션과 데이터 소스 사이의 중개 레이어 역활을 합니다. MVVM 아키텍처에서 local과 remote의 두가지 데이터 소스의 중개 레이어 역활을 담당하며 데이터 소스의 교체 및 사용을 용이하게 합니다. Repository를 사용하는 부분에서는 local에서 데이터를 가져왔는지 remote에서 데이터를 가져왔는지 알 필요없이 데이터를 사용할 수 있습니다. 


5. What is MVI Pattern?

MVI는 Model, View, Intent를 의미합니다. 여기서 Intent는 Android의 Intent와는 다릅니다. Intenet는 앱의 상태를 변화시키려는 의도를 의미합니다. Intent를 사용해 앱의 상태를 관리하는 아키텍처 패턴입니다.



6. The lifecycle of ViewModel?



7. How View Model Communicates with activity or views?



8. Can A activity have miltiple view models?



9. Can a view model provide data to multiple views?



10. What is the viewModel factory?



11. What is data bindnig?

데이터 바인딩은 선언형 형식으로 데이터를 Layout에 결합할 수 있게 도와주는 라이브러리 입니다.


12. What is view bindnig?

Android 3.6 부터 제공해주는 기능으로 FindViewById를 대신하여 좀더 쉽게 Layout의 ID을 불러와 사용할 수 있게 해주는 라이브러리 입니다. View Binding은 각각의 XML Layout을 위한 Binding Class를 생성하여 모든 뷰의 ID에 대응하는 값에 직접 접근할 수 있게 해줍니다.


13. What are the differences between data binding and view binding?

1. View binding을 사용하면 <layout> 태그를 사용하지 않아도 자동으로 Binding Class를 생성해줍니다.
2. View binding은 xml에 데이터를 binidng 하지 못합니다.
3. View binding은 Data binding에 비해 좀더 빠르고 효과적입니다. 왜냐하면 Data binding은 Anotation Processors를 사용하기 때문에 View binding을 사용하면 build time과 APK 사이즈를 상대적으로 줄일 수 있습니다.


PRO ANDORID DEV : [New In Android: View Binding](https://proandroiddev.com/new-in-android-viewbindings-the-difference-from-databinding-library-bef5945baf5e)