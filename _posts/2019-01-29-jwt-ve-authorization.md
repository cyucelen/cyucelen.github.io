---
layout: post
title: "JWT ve Authorization"
date: 2019-01-29 22:45:05 +0300
jsarr:
- graphs/jwt-login.js
- graphs/jwt-order.js
categories: Microservices Authorization
tags: JWT authorization auth

---


JWT(JSON Web Token) taraflar arasında güvenilir ve doğrulanabilir veri aktarımını sağlamak için geliştirilmiş bir standarttır.
Aslında çok basitçe şöyle düşünebiliriz: kim tarafından gönderildiğini doğrulayabildiğiniz bir JSON.

# Saçma bir hikaye

![](/images/mehmet-amca-jwt.jpg){: .align-center}

Bu yaşlı amcamızın adı Mehmet. Mehmet amca küçük bir köyde yaşar ve bir ayağı çukurdadır. Yaşlılıktan dolayı unutkanlık sorunu çeken Mehmet amca, artık oğlunun yüzünü
bile hatırlamaz olmuştur. Yıllardır göremediği hayırsız oğlundan haber alıp son bir kez görmek için bir oyun hazırlar. Kendisine piyangodan büyük ikramiye çıkmış gibi 
haber yayıp oğlunun kendisini bulmasını sağlayacaktır. Bunun için broşürler bastırıp, duvarlara yapıştırılması için küçük çocuklara verir. Broşürü okuyanlara, Mehmet
amcanın verdiği postaneye mektup yazmalarını ve altına imza atmalarını ister. Mehmet amca oğlunu hatırlamadığı ve tanıyamayacağı için böyle bir yöntem seçmiştir ve
hangi mektubun oğlunun olduğunu anlamak için mektuplardaki imzalar ile evde bulduğu oğlunun imzasını karşılaştıracaktır. Bir hafta içerisinde Mehmet amcaya,
2139 tane mektup gelir ve Mehmet amca o mektuplar arasından oğlunun mektubunu *unique* imzası sayesinde bulur. ***MUTLU SON***

# JWT'nin yapısı

Bir JWT, Header, Payload ve Signature olmak üzere 3 kısımdan oluşuyor. 

``` 
[Header].[Payload].[Signature]
```

Header, Payload encode ediliyor ve Signature üretilip her bir kısım nokta ile birbirinden ayrılıyor.


Her bir kısımı ayrı ayrı inceleyelim.

## 1- Header

JWT'nin header kısmı(JOSE header olarak ta bilinir) JWT imzasının hangi algoritma ile hesaplandığını belirtir. JWT'ler simetrik veya asimetrik olarak imzalanabilir.

### Örnek Header
```json
{
    "typ": "JWT",
    "alg": "HS256"
}
```

```json
Base64URL Encode: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

## 2- Payload

JWT'nin payload kısmı asıl verinin tutulduğu kısımdır. Kendi istediğiniz **claim**'leri ve JWT standartı tarafından belirtilenleri içeren bölüm burasıdır.

> Payload içerisindeki her bir key-value pair'a *claim* deniyor.

Standartta belirtilen bazı özel claimler:

| Issuer (iss)          | Tokeni veren yetkiliyi tanımlar.                          |
| Subject (sub)         | Tokenin hangi konu hakkında olduğunu tanımlar.            |
| Audience (aud)        | Tokenin kimler için üretildiği tanımlar.                  |
| Expiration time (exp) | Tokenin son kullanma tarihini tanımlar.                   |
| Not before (nbf)      | Tokenin hangi tarihten önce kullanılamayacağını tanımlar. |
| Issued at time (iat)  | Tokenin ne zaman üretildiğini tanımlar.                   |
| JWT ID (jti)          | Tokenin unique id'sini tanımlar.                          |

***Not**: Bu claim'leri kullanmak zorunlu değildir.*

### Örnek Payload
```json
{
    "iss": "cyucelen.com",
    "exp": 1548596626,
    "name": "John Doe",
    "admin": true,
    "userID": 123456
}
```

```json
Base64URL Encode: eyJpc3MiOiJjeXVjZWxlbi5jb20iLCJleHAiOjE1NDg1OTY2MjYsIm5hbWUiOiJKb2huIERvZSIsImFkbWluIjp0cnVlLCJ1c2VySUQiOjEyMzQ1Nn0
```

## 3- Signature

İmzayı üretmek için, encode ettiğimiz Header ve payload kısmını nokta ile birleştirip, Header'da belirttiğimiz hash algoritmasını kullanarak gizli anahtarımız ile imzalıyoruz.

#### Pseudo kod

```javascript
secretKey = "my_super_secret_key"

unsignedToken = base64URLEncode(header) + "." + base64URLEncode(payload)

signature = HMAC-SHA256(unsignedToken, secretKey)

// signature: aJwsLMKymCdaDJpSZfyKt5upK8zImI7JwFxv0wgLDk4
```


## Tokeni oluşturalım

Tüm parçaları elde ettiğimize göre, geriye birleştirmek kaldı.

Header, Payload ve Signature'ı nokta ile birleştiriyoruz ve..

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjeXVjZWxlbi5jb20iLCJleHAiOjE1NDg1OTY2MjYsIm5hbWUiOiJKb2huIERvZSIsImFkbWluIjp0cnVlLCJ1c2VySUQiOjEyMzQ1Nn0.aJwsLMKymCdaDJpSZfyKt5upK8zImI7JwFxv0wgLDk4
```

tokenimiz hazır.



# Gelelim fasulyenin faydalarına

![](/images/jwt-meme.png){: .align-left}

JWT tokenin nasıl oluşturulduğunu anladığımıza göre, nerede ve nasıl kullanıldığına bir senaryo üzerinden bakalım.

Bir e-ticaret platformumuz olsun. Microservice takılıyoruz, iyi güzel. Alış-veriş sitemizin olmazsa olmazı kullanıcılar olduğundan dolayı,
bir şekilde siteye kayıt olmalarını ve giriş yapıp, alış-veriş yapmalarını sağlamamız lazım.

Sisteme kayıtlı bir kullanıcının, nasıl giriş yapıp JWT aldığına bir bakalım.

*Diyagram karışık duruyorsa node'ları sağa sola çekiştirip düzeltin veya sayfayı yenileyin.*
<style type="text/css">
      #jwt-login-architecture {
      width: 100%;
      height: 500px;
      border: 1px solid lightgray;
      }
</style>

<div id="jwt-login-architecture"></div>
<br>

Servicelerimizin önünde bir tane Ingress gateway var ve trafik bu gateway üzerinden dağıtılıyor.

Mehmet amca alış-veriş yapmak için siteye giriş yapıyor.

```json
// POST https://www.hepsinerede.com/login
{
    "username": "mehmet_amcaniz",
    "password": "01021942"
}
```

Login request'i ingress uzerinden Login servisine gidiyor ve doğrulandıktan sonra, Auth servisinden Mehmet amca için token isteniyor.
Diyelim ki tokenimizin içerisine Mehmet amcanın kullanıcı numarasını ve erişebileceği kaynakları yazacağız. Auth Database'inden bu bilgileri
alarak tokenin içerisine yazalım.

```json
// Secret Key: hepsi-nerede-2019

// Mehmet amcanın JWT'si

// Header
{
    "typ": "JWT",
    "alg": "HS256"
}

// Payload
{
    "iss": "auth.hepsinerede.com",
    "exp": 1548596626,
    "name": "Mehmet Amca",
    "username": "mehmet_amcaniz",
    "userID": 123456,
    "resources": ["orders/mehmet_amcaniz"]
}

// JWT: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhdXRoLmhlcHNpbmVyZWRlLmNvbSIsImV4cCI6MTU0ODU5NjYyNiwibmFtZSI6Ik1laG1ldCBBbWNhIiwidXNlcm5hbWUiOiJtZWhtZXRfYW1jYW5peiIsInVzZXJJRCI6MTIzNDU2LCJyZXNvdXJjZXMiOlsib3JkZXJzL21laG1ldF9hbWNhbml6Il19.WvoLX4uQBlB0cuD_1dpuewgrlXGgPK65b2vBJc-E9Co
```

Oluşturduğumuz tokeni Mehmet amcaya veriyoruz ve Mehmet amca göndereceği her request içerisine bu tokeni ekliyor.

> JWT'yi request'in headerina `Authorization: Bearer <token>` şeklinde ekleyebilirsiniz.

Şimdi de gelen request içerisindeki JWT'yi nasıl doğruladığımıza bir bakalım.

#### Mehmet amca verdiği siparişlere bakmak istiyor.

<style type="text/css">
      #jwt-order-architecture {
      width: 100%;
      height: 500px;
      border: 1px solid lightgray;
      }
</style>

<div id="jwt-order-architecture"></div>
<br>

Mehmet amca siteye girip siparişlerim butonuna tıkladı ve
`https://www.hepsinerede.com/order/mehmet_amcaniz` adresine tokeni ile bir `GET` requesti yolladı.

Ingress gateway'e ulaşan bu request, Mehmet amcanın bu resource'a erişim yetkisinin olup olmadığının doğrulanması için Authorization servisine
yönlendiriliyor.

Authorization servisimiz gelen tokenin herhangi bir şekilde değiştirilip değiştirilmediğinden emin olmak için ilk önce imzayı kontrol ediyor.
Header kısmını decode edip hangi algoritma ile imzalandığına bakıyor, ve encode edilmiş Header ve Payload kısımlarını gizli anahtar(`hepsi-nerede-2019`) ile Header kısmında
belirtilen algoritmayı kullanarak imzalayıp, gelen tokendeki imza ile kendi ürettiğini karşılaştırıyor.

Eğer imzalar eşleşir ise tokenin içeriğinin değişmediğinden emin oluyor ve 
Payload içerisinde kontrol etmek istediği bilgileri kontrol edip *-**(iss)** token gerçekten yetkili bir kaynak tarafından mı verilmiş? **(exp)** süresi dolmuş mu? **(resources)**kaynağa erişimi mümkün mü? vs.-*, 
istenilen resource'a erişmesine izin veriyor veya vermiyor.

> Bu kısımda dikkat edilmesi gereken şey, gördüğünüz üzere JWT'nin amacı herhangi bir şekilde veriyi gizlemek değil. İçerisindeki veri Base64URL ile decode edilerek rahatlıkla görüntülenebilir. Yani tokeni eline alabilen herkes içeriğini görebilir. Fakat imzalandığı için içerisindeki veriyi değiştiremez. Eğer gizliliği önemli bir veri taşıyacaksanız tokeni encrypt etmeniz faydanıza olacaktır. (bkz: [JWE](https://tools.ietf.org/html/rfc7516))

### Değiştirsek ne olur?

![](/images/cat.gif){: .align-left}

Mehmet amcaya verilen tokeni decode edip herhangi bir yerini değiştirip geri encode edip gönderelim bakalım ne oluyor.
Basitçe, JWT deki encoded payload kısmının yerine, değiştirip encode ettiğimiz payload'ı koyalım.
<br/><br/><br/><br/><br/><br/><br/>

```json
// Mehmet Amcanın JWT'si: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhdXRoLmhlcHNpbmVyZWRlLmNvbSIsImV4cCI6MTU0ODU5NjYyNiwibmFtZSI6Ik1laG1ldCBBbWNhIiwidXNlcm5hbWUiOiJtZWhtZXRfYW1jYW5peiIsInVzZXJJRCI6MTIzNDU2LCJyZXNvdXJjZXMiOlsib3JkZXJzL21laG1ldF9hbWNhbml6Il19.WvoLX4uQBlB0cuD_1dpuewgrlXGgPK65b2vBJc-E9Co

// Base64URL encoded payload: eyJpc3MiOiJhdXRoLmhlcHNpbmVyZWRlLmNvbSIsImV4cCI6MTU0ODU5NjYyNiwibmFtZSI6Ik1laG1ldCBBbWNhIiwidXNlcm5hbWUiOiJtZWhtZXRfYW1jYW5peiIsInVzZXJJRCI6MTIzNDU2LCJyZXNvdXJjZXMiOlsib3JkZXJzL21laG1ldF9hbWNhbml6Il19

// Decoded Payload
{
    "iss": "auth.hepsinerede.com",
    "exp": 1548596626,
    "name": "Mehmet Amca",
    "username": "mehmet_amcaniz",
    "userID": 123456,
    "resources": ["orders/mehmet_amcaniz"]
}

//Payload'ımızı biraz değiştirelim.

// Değiştirilmiş payload
{
    "iss": "auth.hepsinerede.com",
    "exp": 1548596626,
    "name": "Mehmet Amca",
    "username": "mehmet_amcaniz",
    "userID": 123456,
    "resources": ["orders/mehmet_amcaniz", "orders/ahmet_amcaniz"]
}

// Base64URL encoded değiştirilmiş payload: ewogICAgImlzcyI6ICJhdXRoLmhlcHNpbmVyZWRlLmNvbSIsCiAgICAiZXhwIjogMTU0ODU5NjYyNiwKICAgICJuYW1lIjogIk1laG1ldCBBbWNhIiwKICAgICJ1c2VybmFtZSI6ICJtZWhtZXRfYW1jYW5peiIsCiAgICAidXNlcklEIjogMTIzNDU2LAogICAgInJlc291cmNlcyI6IFsib3JkZXJzL21laG1ldF9hbWNhbml6IiwgIm9yZGVycy9haG1ldF9hbWNhbml6Il0KfQ

// Değiştirilmiş JWT: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.ewogICAgImlzcyI6ICJhdXRoLmhlcHNpbmVyZWRlLmNvbSIsCiAgICAiZXhwIjogMTU0ODU5NjYyNiwKICAgICJuYW1lIjogIk1laG1ldCBBbWNhIiwKICAgICJ1c2VybmFtZSI6ICJtZWhtZXRfYW1jYW5peiIsCiAgICAidXNlcklEIjogMTIzNDU2LAogICAgInJlc291cmNlcyI6IFsib3JkZXJzL21laG1ldF9hbWNhbml6IiwgIm9yZGVycy9haG1ldF9hbWNhbml6Il0KfQ.WvoLX4uQBlB0cuD_1dpuewgrlXGgPK65b2vBJc-E9Co
```

Eee madem artık Ahmet amcanın siparişlerine erişimimiz var, bir bakalım neler almış dedik ve `https://www.hepsinerede.com/order/ahmet_amcaniz` adresine yolladık requesti.

Auth servisimiz tokeni aldı, encode edilmiş Header ve Payload kısımlarını kullanarak, **gizli anahtar** (`hepsi-nerede-2019`) ile bir imza üretti, ve ne görsün:

```json
// Gizli anahtar ile gelen Header ve Payload'tan üretilen imza: NIuImBIBI8i_zjP-uidhF4g1Z-J26magFWnQlzLubXA
// JWT içerisindeki imza: WvoLX4uQBlB0cuD_1dpuewgrlXGgPK65b2vBJc-E9Co
```

![](/images/gandalf_pass.gif){: .align-center}