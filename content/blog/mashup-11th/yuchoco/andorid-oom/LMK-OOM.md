---
title: Android LMK,OOM
date: "2021-08-31"
tags: ["mash-up", "yuchocopie", "andorid", "lmk","oom","memory"]
description: "안드로이드 LMK 와 OOM에 대해 알아봅니다."
cover: "./ic_cover.png"
---



안녕하세요 유초코입니다 :)

안드로이드 LMK (low-memory killer)에 대해 알아보다가 OOM과 LMK가 어떤 관계인지 이야기를 해보려 이 주제를 가지고 왔어요 :)

먼저 안드로이드 플랫폼에서 **프로세스간에 메모리를 어떻게 할당**하는지 알아보며 **LMK와 OOM**에 대해 알아보도록 하겠습니다!



### 메모리 유형

먼저 안드로이드 기기에는 RAM, zRAM, Storage 세가지의 메모리 유형이 있고, CPU와 GPU는 모두 동일한 RAM에 접근합니다.

> 여기서 **RAM**(랜덤 액세스 메모리)는 시스템의 단기 데이터 스토리지로, 정보에 빠르게 액세스할 수 있도록 컴퓨터가 실시간으로 사용하는 정보를 저장하는 공간이고, 시스템에서 많은 프로그램을 실행할수록 더 많은 메모리가 필요로 합니다.

![memory-types](/Users/kim-yujeong/work/mash-up11th/mashup-android/content/blog/mashup-11th/yuchoco/andorid-oom/memory-types.svg)

- RAM: 가장 빠른 메모리 유형이지만 크기가 제한된 고급 자원입니다.
- zRAM: RAM의 파티션으로 스왑 공간으로 사용됩니다. 모든 것은 zRAM에 배치될 때 압축되고 zRAM에서 복사될 때 압축이 해제된다. 이 부분의 RAM은 페이지가 zRAM으로 들어오거나 zRAM에서 나갈 때 크기가 커지거나 작아집니다.
- Storage: 파일 시스템, 모든 앱 라이브러리, 플랫폼에 포함된 개체 코드와 같은 영구데이터가 모두 포함됩니다.



### 메모리 페이지

RAM은 페이지로 나뉩니다 (일반적으로 각 페이지는 4KB)

여기서 페이지는 free(*사용 가능)*하거나 used(사용된) 것으로 간주되는데, 사용 가능한 페이지는 사용하지 않은 RAM이고 사용 된 페이지는 시스템에서 사용 중인 RAM입니다.

RAM은 다음과 같이 그룹화 할 수 있는데요

사용 가능한 페이지와 사용된 페이지의 비율은 시스템에서 활발하게 RAM을 관리하므로 시간이 지남에 따라 달라지고 해당 개념이 메모리가 부족한 상황을 관리하는 데 핵심이 됩니다.

- Cached: 저장소의 파일로 지원되는 메모리 (예: 코드 또는 메모리 매핑된 파일). 

  - Private: 하나의 프로세스에서 소유하고 공유되지 않음
    - Clean: 저장소에 있는 파일의 수정되지 않은 복사본. [kswapd](https://developer.android.com/topic/performance/memory-management?hl=ko#kswapd)로 삭제하여 사용 가능한 메모리를 늘릴 수 있다.
    - Dirty: 저장소에 있는 파일의 수정된 복사본. `kswapd`를 통해 zRAM으로 이동하거나 zRAM에서 압축하여 사용 가능한 메모리를 늘릴 수 있다.
  - Shared: 여러 프로세스에서 사용한다.
    - Clean: 저장소에 있는 파일의 수정되지 않은 복사본. `kswapd`로 삭제하여 사용 가능한 메모리를 늘릴 수 있다.
    - Dirty: 저장소에 있는 파일의 수정된 복사본. `kswapd`를 통해 또는 [msync()](<https://developer.android.com/reference/android/system/Os?hl=ko#msync(long,%2520long,%2520int)>)`나 `[munmap()](<https://developer.android.com/reference/android/system/Os?hl=ko#munmap(long,%2520long)>)을 명시적으로 사용하여 저장소에 있는 파일에 변경사항을 다시 써서 사용 가능한 메모리를 늘릴 수 있다.

- Anonymous: storage의 파일로 지원되지 않는메모리입니다(예: `MAP_ANONYMOUS`

   플래그가 설정된 [mmap()](<https://developer.android.com/reference/android/system/Os?hl=ko#mmap(long,%2520long,%2520int,%2520int,%2520java.io.FileDescriptor,%2520long)>)을 통해 할당됨).

  - Dirty: `kswapd`를 통해 zRAM으로 이동하거나 zRAM에서 압축하여 사용 가능한 메모리를 늘릴 수 있다.

```
<details>
<summary>참고</summary>
<div markdown="1">

클린 페이지에는 저장소에 있는 파일(또는 파일의 일부)의 정확한 복사본이 포함된다. 클린 페이지가 더 이상 파일의 정확한 복사본을 포함하지 않을 때 더티 페이지가 된다(예: 애플리케이션 작업의 결과로). 클린 페이지는 저장소의 데이터를 사용하여 항상 다시 생성할 수 있기 때문에 삭제할 수 있다. 하지만 더티 페이지는 삭제할 수 없으며 삭제하면 데이터가 손실될 수 있다.

</div>
</details>
```



## LMK(Low memory management) 메모리 부족 관리

Android에는 메모리 부족 상황을 처리하는 두 가지 기본 메커니즘으로  **kernel swap daemon**(커널 스왑 데몬)과 **low-memory killer**(로우 메모리 킬러)가 있습니다.



### kernel swap daemon 커널 스왑 데몬

커널 스왑 데몬(`kswapd`)은 Linux 커널의 일부이고 사용된 메모리를 사용 가능한 메모리로 변환해주는데요. 데몬은 기기의 사용가능한 메모리가 부족해질 때 활성화 되고 Linux 커널은 사용 가능한 메모리의 낮은 임계값과 높은 임계값을 유지합니다. 사용 가능한 메모리가 낮은 임계값 아래로 떨어지면 `kswapd`가 메모리를 회수하기 시작하고 사용 가능한 메모리가 높은 임계값에 도달하면 `kswapd`가 메모리 회수를 중지하죠.

앞서 메모리 페이지를 분리하며 수정되지 않은 복사본 클린페이지와 수정된 복사본더티페이지가 있었습니다. 두 페이지에 따라 kswapd의 동작은 다음과 같습니다.

- 클린 페이지

  `kswapd`는 클린 페이지를 삭제하여 회수할 수 있습니다. 프로세스가 삭제된 클린 페이지를 처리하려고 하면 시스템은 페이지를 저장소에서 RAM으로 복사하고 이 작업을 demand paging 이라고 합니다.

   ![delete-clean-page](/Users/kim-yujeong/work/mash-up11th/mashup-android/content/blog/mashup-11th/yuchoco/andorid-oom/delete-clean-page.svg)

- 더티 페이지

  `kswapd`는 캐시된 private dirty 페이지와 anonymous dirty 페이지를 zRAM으로 이동할 수 있고 zRAM에서 이동한 페이지가 압축되어 RAM에서 사용할 수 있는 메모리(사용 가능한 페이지)가 확보됩니다. 프로세스가 zRAM의 더티 페이지를 터치하려고 하면 페이지가 압축 해제되고 다시 RAM으로 이동하고 압축된 페이지와 연결된 프로세스가 종료되면 페이지가 zRAM에서 삭제됩니다.

  ![compressed-dirty-page](/Users/kim-yujeong/work/mash-up11th/mashup-android/content/blog/mashup-11th/yuchoco/andorid-oom/compressed-dirty-page.svg)



`kswapd` 으로는 시스템에 충분한 메모리를 확보할 수 없는 경우가 많습니다. 사용 가능한 메모리 양이 특정 임계값 아래로 떨어지면 시스템은 [onTrimMemory()](<https://developer.android.com/reference/android/content/ComponentCallbacks2?hl=ko#onTrimMemory(int)>)를 사용해 메모리가 부족하고 할당량을 줄여야 한다고 앱에 알리는데요. 이 방법으로 충분하지 않으면 **커널이 메모리를 확보하려고 프로세스를 종료하기 시작하고** 이 작업을 실행하기 위해 로우 메모리 킬러(low-memory killer, **LMK**)를 사용합니다.



### Low-memory killer 로우 메모리 킬러

 LMK는 [oom_adj_score](https://android.googlesource.com/platform/system/core/+/master/lmkd/README.md)라는 '메모리 부족' 점수를 사용하여 종료할 프로세스를 판단합니다. 실행 중인 프로세스의 우선순위를 정하고 최고점수를 얻은 프로세스가 먼저 종료되는데 백그라운드 앱이 먼저 종료되고 시스템 프로세스가 마지막에 종료됩니다. 다음 표는 LMK 점수 카테고리가 높은 점수에서 낮은 점수로 나열되어 있는데 최고 점수 카테고리인 첫 번째 행의 항목이 먼저 종료됩니다.

![lmk-process-order](/Users/kim-yujeong/work/mash-up11th/mashup-android/content/blog/mashup-11th/yuchoco/andorid-oom/lmk-process-order.svg)

- Background app: 이전에 실행되었고 현재는 활성화되지 않은 앱, LMK는 `oom_adj_score`가 가장 높은 백그라운드 앱부터 먼저 종료합니다
- Previous app: 가장 최근에 사용한 백그라운드 앱, 이전 앱은 백그라운드 앱보다 우선순위가 높고 점수가 낮습니다. (사용자가 백그라운드 앱보다 이전 앱으로 전환할 가능성이 높기 때문에)
- Home app: 런처 앱입니다. 해당 앱을 종료하면 배경화면이 사라집니다.
- Services: 서비스는 애플리케이션에서 시작되고 클라우드 동기화 또는 클라우드 업로드를 포함할 수 있습니다.
- Perceptible app: 사용자가 어떤 식으로든 인식할 수 있는 포그라운드에 없는 앱 (예: 작은 UI를 표시하는 검색 프로세스 실행 또는 음악 듣기).
- Foreground app: 현재 사용 중인 앱, 포그라운드 앱을 종료하면 애플리케이션이 비정상 종료되는 것처럼 보여서 사용자가 기기에 문제가 있다고 생각할 수 있다.
- Persistent (서비스): 텔레포니, Wi-Fi와 같은 기기의 핵심 서비스입니다.
- System(시스템 프로세스): 해당 프로세스가 종료되면 기기가 재부팅된 것처럼 보일 수 있다.
- Native: 시스템에서 사용하는 매우 낮은 수준의 프로세스(예: `kswapd`).

 

LMK가 하는 일은 위와 같았습니다. 그러면 OOM은 무엇일까요?

OOM 은 Linux 커널에서 예전부터 쭉 존재해온 메모리 관리 모듈입니다. OOM이 휴대폰 기기에 들어가는 시스템에는 안맞다고 생각하여 OOM이 발생하지 않도록 메모리를 관리하고자 Android 에서 만든게 LMK 인데요. 즉, Android 에는 LMK 와 OOM이 다 있고 동작하지만  OOM 이 발생되면 파급 효과가 크기 때문에 이러한 것을 방지하고자 동작하는 것이 LMK 인 것입니다.



그럼 OOM이 무엇이길래 파급효과가 크다는 것일까요?



## OOM

jvm이 메모리가 부족해 객체를 할당할 수 없고 garbage collector가 더 이상 메모리를 사용할 수 없을 때 발생합니다.

### OOM Killer

OOM이 발생하지 않도록 **적은 프로세스**를 죽여 **많은 메모리**를 확보합니다. 그렇기 때문에, 특정 프로세스가 죽지 않는다는 보장을 할 수 없게 됨

### OOM 발생 원인

커널은 Virtual memory를 이용한 메모리 할당을 하므로 실제 가용한 physical 메모리 보다 큰 프로그램 size의 메모리를 할당 할 수 있습니다. 즉 프로그램에서 당장 사용하지 않는 메모리는 나중에 할당하기 때문에 실제로 사용 가능한 메모리를 초과한 프로세스가 load 될 수 있게 됩니다 (이 것을 overcommit 이라고 부릅니다.)

만약 overcommit된 메모리가 실제 쓰여지게될 경우 실제 메모리가 부족하게 되므로  Out of memory가 발생하게 됩니다.

안드로이드에서 OutOfMemoryError 가 발생하는 가장 많은 경우는 **비트맵 로딩** 때문인데요

안드로이드 3.0 이하에서 Bitmap의 메모리가 Dalvik VM에 할당되지 않고 Native Heap 영역에 할당되었습니다. 때문에 Bitmap이 VM의 GC(Garbage Collecting)의 대상이 되지 않았고 OOM이 발생하게 되었죠

> Java 비트맵 객체는 참조가 없을 때 GC에 의해 회수되지만 Native Heap 영역은 GC 수행영역 밖이기 때문에 메모리 소멸 시점이 다릅니다.
>
> Dalvik VM 은 처음동작에 필요한 만큼만 프로세스에 Heap을 할당하게 되고, 할당된 메모리보다 많은 메모리를 필요하게될 때마다 Dalvik Footfrint도 증가 하게 됩니다. 여기서 증가된 Dalvik Footfrint 는 감소하지 않기 때문에 External heap의 크기가 증가되면서OOM이 발생할 수 있습니다.

이러한 문제점 때문에, Honeycomb부터는 네이티브 비트맵 객체를 저장하기 위한 external 영역을 없애고 dalvik heap만 남겼으며 비트맵 픽셀 데이터 자체도 dalvik heap 영역에 저장되었습니다. 그리고 GC(Garbage Collecting)도 접근을 할 수 있게 되었죠...



마지막으로 정리를 해보면, 안드로이드에서는 OOM Killer와 LMK 모두를 사용합니다. OOM 상황에서는 치명적인 상황이 발생하기 때문에 안드로이드에서 LMK 라는 모듈을 추가해 OOM 상황이 발생하기 전에 이를 방지하는 것 입니다.!



#### reference

---

https://developer.android.com/topic/performance/memory-management?hl=ko