---
layout: post
title: "Lambda Calculus & Fonksiyonel Programlama"
date: 2019-08-18 14:00:20 +0300
categories: Functional-Programming Lambda-Calculus Mathematics
tags: lambda calculus functional programming math mathematics
---


**Lambda Calculus** 1930'larda Alonzo Church (*kendisi aynı zamanda Alan Turing'in PhD hocası*) tafarından tanımlanmış, hesaplamaların *lambda* denilen yapılar ile ifade edildiği formal bir sistemdir.

# Calculus?! 

Öncelikle *Calculus* sözcüğünün aklımıza ilk olarak getirdiği türev integral gibi çağrışımları bir kenara bırakmak adına *Calculus* kelimesinin tanımını yapmaya çalışalım.

> *Calculus*, problemleri, özel bir cebirsel gösterim ve metotlar ile tanımlamak için kullanılan sistematik yöntemleri ifade eder. 

Basitçe, spesifik bir calculuste çeşitli cebirsel sembolleri manipule etmek üzerine belirlenmiş kesin kurallar vardır. Bu kurallar ve semboller bütününü kullanarak sistemleri ifade ederiz.

## Bize böyle denmemişti..

Çok yaygın olarak bilinen ve birbiri ile yakından alakalı, sistemlerdeki değer değişimlerini hesaplamamızı sağlayan **Differantial Calculus** ve alan, yüzey, hacim gibi hesapları yapabildiğimiz **Integral Calculus**, ikilisi genellikle birlikte *-sanki sadece bir calculus varmış gibi-* **Calculus** olarak biliniyor.

> ![](/images/calculus-meme.jpg){: .align-left}
> ***Deep Note***
> 
> Matematiğin bu devrimsel kavramlarını Isaac Newton ve Gottfried Leibniz'in yakın zamanlarda birbirinden bağımsız olarak keşfettiği biliniyor. Her ne kadar Isaac Newton, *(Differential/Integral)* ***Calculus***'ün babası olarak bilinse de, bugün problemleri çözmekte kullandığımız çoğu metot ve semboller Leibniz'den geliyor.
>

*μ-calculus*, *π-calculus*, *tuple relational calculus* gibi bilgisayar bilimleri alanında kullanılan çok çeşitli formal sistemler var fakat bu yazıda üzerinde duracağımız konu fonksiyonel programlamanın temellerini oluşturan **λ-calculus**(*lambda calculus*).

---

# Nereden Çıktı Bu Lambda Calculus

### Entscheidungsproblem?

![](/images/german-scrabble.jpg){: .align-center}


1928 yılında matematikçi David Hilbert *"matematiksel mantığın ana problemi"* olarak ortaya Entscheidungsproblem (İngilizcesi: *"Decideability problem"*, Türkçesi: "*Karar verilebilirlik problemi*") adında bir problem öne sürer.

Problemin basitleştirilmiş tanımı şöyledir:

> Herhangi bir matematiksel önermenin doğruluğunu veya yanlışlığını belirlemek için bir algoritma bulmak mümkün müdür?

Başka bir deyişle, birinci derece mantıktaki herhangi bir önermeyi girdi olarak kabul eden ve, hesaplamaların sonucunda önerme için "*Doğru (1)*" veya "*Yanlış (0)*" olarak bir sonuç veren bir algoritma var olabilir mi? Yoksa böyle bir algoritma var olamaz, yani bazı önermeler için hiç bir zaman bir çıktı üretemez, **karar veremez** mi?

***Not:** Bahsi geçen "birinci derece mantık", lise veya üniversitede matematik derslerinde gördüğümüz mantık kurallarından başka bir şey değil. (*ve, veya, eğer, ancak ve ancak, 1, 0..*)*

# Church ve Turing

1936 yılında, Alonzo Church ve öğrencisi Alan Turing, *Church-Turing* tezini yayınladı ve *"karar verilebilirlik problemine"* cevapları negatifti. Böyle bir algoritmanın var olması mümkün değildi.

Turing bunu göstermek için, kendi tezinde **Turing Machine** olarak adlandırdığı bir model oluşturdu ve bu model üzerinden karar verilemeyecek problemlerin var olduğunu ispatladı. Turing Machine'in bu açıdan önemi büyük çünkü Alan Turing bu model ile aynı zamanda hesaplanabilirliğin sınırlarını çiziyordu. Yani, insanlar tarafından hesaplanabilen her şey Turing Machine tarafından hesaplanabilir diyordu. Bu da demek oluyor ki, günümüzde var olan her algoritma, Turing Machine modeli ile ifade edilebilir. Halen sahip olduğumuz en **güçlü** model halen bu.

> Burada **güçlü** kelimesi, modelin çözümlerini ifade edebildiği problemlerin sayısının büyüklüğünü ifade etmektedir. 

*Turing Machine ve Karar Verilebilirlik konusunu Automata Theory ile ilgili yazmak istediğim diğer yazılarda ayrıntılı incelemek istiyorum çünkü başlıca incelenmesi gereken bir konu.*

Alonzo Church ise bu cevabı 1920'lerin sonunda geliştirmiş olduğu **lambda calculus** modelini kullanarak vermişti. 1937 yılında Alan Turing, *Turing Machine* ile *Lambda Calculus* modellerinin birbirine denk olduğunu ispatladı. Yani, Turing'in modeli ile hesaplanabilen herhangi bir problem Lambda Calculus ile hesaplanabilirdi ve tersi de geçerliydi.

> ![](/images/thug-turing.jpg){: .align-left}
> ***Anekdot***
>
> Eğer bir hesaplama sistemi, Turing Machine modeliyle denk ise *Turing-Complete** olarak adlandırılır.
> 

---

$$\require{extpfeil}\Newextarrow{\xRightarrow}{5,5}{0x21D2}$$
$$\xRightarrow[\text{text below}]{}$$
$$\lambda x.x$$

$$\underbrace{\lambda x}_{\text{head}}.\underbrace{x}_{\text{body}}$$
