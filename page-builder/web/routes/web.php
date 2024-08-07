<?php

use App\Exceptions\ShopifyProductCreatorException;
use App\Lib\AuthRedirection;
use App\Lib\EnsureBilling;
use App\Lib\ProductCreator;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Shopify\Auth\OAuth;
use Shopify\Auth\Session as AuthSession;
use Shopify\Clients\HttpHeaders;
use Shopify\Clients\Rest;
use Shopify\Context;
use Shopify\Exception\InvalidWebhookException;
use Shopify\Utils;
use Shopify\Webhooks\Registry;
use Shopify\Webhooks\Topics;
use Shopify\Clients\Graphql;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
| If you are adding routes outside of the /api path, remember to also add a
| proxy rule for them in web/frontend/vite.config.js
|
*/

Route::fallback(function (Request $request) {
    if (Context::$IS_EMBEDDED_APP &&  $request->query("embedded", false) === "1") {
        if (env('APP_ENV') === 'production') {
            return file_get_contents(public_path('index.html'));
        } else {
            return file_get_contents(base_path('frontend/index.html'));
        }
    } else {
        return redirect(Utils::getEmbeddedAppUrl($request->query("host", null)) . "/" . $request->path());
    }
})->middleware('shopify.installed');

Route::get('/api/auth', function (Request $request) {
    $shop = Utils::sanitizeShopDomain($request->query('shop'));

    // Delete any previously created OAuth sessions that were not completed (don't have an access token)
    Session::where('shop', $shop)->where('access_token', null)->delete();

    return AuthRedirection::redirect($request);
});

Route::get('/api/auth/callback', function (Request $request) {
    $session = OAuth::callback(
        $request->cookie(),
        $request->query(),
        ['App\Lib\CookieHandler', 'saveShopifyCookie'],
    );

    $host = $request->query('host');
    $shop = Utils::sanitizeShopDomain($request->query('shop'));

    $response = Registry::register('/api/webhooks', Topics::APP_UNINSTALLED, $shop, $session->getAccessToken());
    if ($response->isSuccess()) {
        Log::debug("Registered APP_UNINSTALLED webhook for shop $shop");
    } else {
        Log::error(
            "Failed to register APP_UNINSTALLED webhook for shop $shop with response body: " .
                print_r($response->getBody(), true)
        );
    }

    $redirectUrl = Utils::getEmbeddedAppUrl($host);
    if (Config::get('shopify.billing.required')) {
        list($hasPayment, $confirmationUrl) = EnsureBilling::check($session, Config::get('shopify.billing'));

        if (!$hasPayment) {
            $redirectUrl = $confirmationUrl;
        }
    }

    return redirect($redirectUrl);
});

Route::get('/api/products/count', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active
    /*
    return response($session);
    echo '<pre>'; print_r($session); die;
     */
   // error_log(print_r($session, true) . "\r\n", 3, 'debug.log');
  //  error_log(print_r($request, true) . "\r\n", 3, 'debug.log');
   

    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get('products/count');

    $client = new Graphql($session->getShop(), $session->getAccessToken());


    $query = <<<QUERY
    mutation CreateMetaobjectDefinition(\$definition: MetaobjectDefinitionCreateInput!) {
        metaobjectDefinitionCreate(definition: \$definition) {
        metaobjectDefinition {
            name
            type
            fieldDefinitions {
            name
            key
            }
        }
        userErrors {
            field
            message
            code
        }
        }
    }
    QUERY;

    $variables = [
    "definition" => [
        "name" => "lookbook",
        "type" => "lookbook",
        "fieldDefinitions" => [
            ["name"=> "Hex", 'key' => 'hex', 'type' => 'single_line_text_field']
        ]
    ],
    ];

    // $response = $client->query(["query" => $query, "variables" => $variables]);
    // $body = $response->getDecodedBody();
    // error_log(print_r($body, true) . "\r\n", 3, 'debug.log');
    
    $query = <<<QUERY
    mutation CreateMetaobject(\$metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: \$metaobject) {
        metaobject {
            id
            handle
            hex: field(key: "hex") {
            value
            }
        }
        userErrors {
            field
            message
            code
        }
        }
    }
    QUERY;

    $html = '<div class="z-bg z-container">  <div class="z-header">    <div class="z-logo z-img">          </div>    <div class="z-nav">      <a href="#z-design" class="z-nav-item">01  ·  Design</a>      <a href="#z-variations" class="z-nav-item">02  ·  Colors</a>      <a href="#z-faq" class="z-nav-item">03  ·  FAQ</a>    </div>    <div class="z-preorder">      <a class="z-btn font-m z-font esrc-btn-cash" href="javascript:void(0); ">        Order Now      </a>    </div>  </div>    <div class="z-rev">    <div class="z-rev-inner z-img z-pc">          </div>    <div class="z-rev-m z-m">      <div class="z-rev-m-title1">Revolutionize Your Everyday Carry</div>      <div class="z-rev-m-title2">ESR GeoFind My Wallet</div>      <div class="z-rev-m-img z-img"></div>    </div>        <div class="z-form-1" style="color: #fff; ">      <div class="z-form-1-txt">        <div class="z-form-1-title font-b">Time is running out for your $10 discount. Order now.</div>      </div>            <div class="esrc-time-box" style="display: none;">          <div class="esrc-time-item">            <div class="esrc-time-number esrc-time-block font-b" id="esrc-time-day">              <div class="w-time" id="w-d1"></div>              <div class="w-time" id="w-d2"></div>            </div>            <div class="esr-time-txt font-b">              Days            </div>          </div>          <div class="esrc-time-item esrc-time-divc">            <div class="esr-time-div">              <div class="esrc-point"></div>              <div class="esrc-point"></div>            </div>          </div>          <div class="esrc-time-item">            <div class="esrc-time-number esrc-time-block font-b" id="esrc-time-hour">              <div class="w-time" id="w-h1"></div>              <div class="w-time" id="w-h2"></div>            </div>            <div class="esr-time-txt font-b">              Hours            </div>          </div>          <div class="esrc-time-item esrc-time-divc">            <div class="esr-time-div">              <div class="esrc-point"></div>              <div class="esrc-point"></div>            </div>          </div>          <div class="esrc-time-item">            <div class="esrc-time-number esrc-time-block font-b" id="esrc-time-minute">              <div class="w-time" id="w-m1"></div>              <div class="w-time" id="w-m2"></div>            </div>            <div class="esr-time-txt font-b">              Minutes            </div>          </div>      </div>              <div class="z-btn z-btn-cat font-m z-font esrc-btn-cash" href="javascript:void(0); "><div class="z-pre-bold">Order Now</div><div class="z-pre-info">Launch Date July 23</div></div>    </div>          </div>    <div class="z-meet z-img">      </div>  <div class="z-meet-m z-m">    <div class="z-m-desc">      <div class="z-m-title font-b">Easy to Find</div>      <div class="z-m-info font-r">The world\'s first wallet that works with the Find My app. At home or out and about, you always know where your wallet is thanks to the app’s sound and positioning prompts.</div>    </div>    <div class="z-meet-m-img z-img">    </div>  </div>    <div id="z-design" class="z-easy z-pc">    <div class="z-easy-inner z-img">          </div>  </div>    <div class="z-sound z-pc">    <div class="z-sound-inner z-img">          </div>  </div>    <div class="z-so z-img">      </div>    <div class="z-large z-img">    <div class="z-large-inner z-img z-pc">          </div>  </div>  <div class="z-large-2 z-pc">    <div class="z-large-2-inner z-img">          </div>  </div>  <div class="z-large-3 z-pc">    <div class="z-large-3-inner z-img">          </div>  </div>    <div class="z-anti z-img">      </div>    <div class="z-form-2" style="display: none; ">    <div class="z-form-2-txt">      <div class="z-form-2-title font-b">Preorder for $1 for your $10 discount</div>      <div class="z-form-2-info font-r">Preorder now for an extra $10 off your Geo Wallet!</div>    </div>    <div class="z-cat-box">      <a class="z-btn z-btn-cat font-m z-font esrc-btn-cash" href="javascript:void(0); ">        Preorder Now      </a>    </div>  </div>    <div id="z-variations" class="z-multi">    <div class="z-multi-txt-box">      <div class="z-multi-title font-b">Available in</div>      <div class="z-multi-info font-r">Elephant Gray, Carbon Fiber, Twilight Black, Opal Gray, Aged Leather, Cocoa, Tangerine </div>    </div>    <div class="z-multi-img-list">      <div id="z-img-item-1" class="z-multi-img-item active">        <img src="https://static.esrgear.com/wp-content/uploads/2024/06/img-big-11.png">      </div>      <div id="z-img-item-2" class="z-multi-img-item">        <img src="https://static.esrgear.com/wp-content/uploads/2024/06/img-big-33.png">      </div>      <div id="z-img-item-3" class="z-multi-img-item">        <img src="https://static.esrgear.com/wp-content/uploads/2024/06/img-big-22.png">      </div>      <div id="z-img-item-4" class="z-multi-img-item">        <img src="https://static.esrgear.com/wp-content/uploads/2024/06/img-big-44.png">      </div>      <div id="z-img-item-5" class="z-multi-img-item">        <img src="https://static.esrgear.com/wp-content/uploads/2024/06/img-big-55.png">      </div>      <div id="z-img-item-6" class="z-multi-img-item">        <img src="https://static.esrgear.com/wp-content/uploads/2024/06/img-big-66.png">      </div>      <div id="z-img-item-7" class="z-multi-img-item">        <img src="https://static.esrgear.com/wp-content/uploads/2024/06/img-big-77.png">      </div>    </div>    <div class="z-multi-action">      <div class="z-multi-icon z-img icon-1" data-id="1"></div>      <div class="z-multi-icon z-img icon-2" data-id="2"></div>      <div class="z-multi-icon z-img icon-3" data-id="3"></div>      <div class="z-multi-icon z-img icon-4" data-id="4"></div>      <div class="z-multi-icon z-img icon-5" data-id="5"></div>      <div class="z-multi-icon z-img icon-6" data-id="6"></div>      <div class="z-multi-icon z-img icon-7" data-id="7"></div>    </div>  </div>    <div id="z-faq" class="z-faq">    <div class="z-faq-top-title font-b">FAQ</div>    <div class="z-faq-list">      <div class="z-faq-item">        <div class="z-faq-title font-b">Which countries do we ship to?<div class="z-faq-icon z-img"></div>        </div>        <div class="z-faq-info">We ship worldwide. In addition, we have local warehouses in the following countries: the United States, the UK, Germany, France, Spain, Italy, Japan, and Australia.</div>      </div>      <div class="z-faq-item">              <div class="z-faq-title font-b">How do I preorder so that I can get a $10 discount?<div class="z-faq-icon z-img"></div>              </div>              <div class="z-faq-info">                <div><span class="z-bold">Preorder:</span> Preorder for $1 to lock in your $10 discount.</div>                <div><span class="z-bold">Pledge:</span> As soon as the campagin goes live on Kickstarter, we’ll notify you so that you can make your pledge.</div><div><span class="z-bold">Save:</span> After the campaign ends, you’ll receive your $10 discount.</div></div>            </div>      <div class="z-faq-item">        <div class="z-faq-title font-b">I\'ve preordered. What do I need to do to get my Geo Wallet?<div class="z-faq-icon z-img"></div>        </div>        <div class="z-faq-info">Our official launch on Kickstarter is July 23, 2024. If you\'ve preordered, you\'ll automatically receive an email from us at that time giving you detailed information on how to get your wallet.</div>      </div>      <div class="z-faq-item">        <div class="z-faq-title font-b">What are the benefits of joining the ESR Facebook community?<div class="z-faq-icon z-img"></div>        </div>        <div class="z-faq-info">          <div><span class="z-bold">Exclusive Updates:</span> Be the first to know about new offers. </div>          <div><span class="z-bold">Community Support:</span> Share your experiences and get advice from other ESR members. </div>          <div><span class="z-bold">Behind-the-Scenes:</span> Get a sneak peek into what goes on behind the scenes at ESR.</div>        </div>      </div>                  </div>  </div>    <div class="z-slider">    <div class="z-wallet z-img">          </div>    <div class="z-wallet z-img">          </div>    <div class="z-wallet z-img">          </div>    <div class="z-wallet z-img">          </div>    <div class="z-wallet z-img">          </div>    <div class="z-wallet z-img">          </div>      </div>    <div class="z-form-3">    <div class="z-form-3-img z-img"></div>    <div class="z-form-3-txt">      <div class="z-form-3-inner">        <div class="z-form-2-title font-b">Get a&nbsp;<span class="z-primary-text z-bold">$10</span>&nbsp;discount. Preorder for $1.</div>        <div class="z-cat-box">          <a class="z-btn z-btn-cat font-m z-font esrc-btn-cash" href="javascript:void(0); ">            Order Now          </a>        </div>              </div>          </div>  </div>    <div class="z-footer z-img">      </div></div><div class="esrc-form-callback" id="esrc-form-callback">  <div class="esrc-popup-close-box">    <div class="esrc-popup-close" id="esrc-popup-close-btn">X</div>  </div>    <div class="esrc-popup-title">  THANK YOU!  </div>  <div class="esrc-popup-info">  Join our official backers Facebook group to get updates throughout the campaign, chat with other backers, and share your feedback.  </div>  <div class="esrc-popup-code esrc-img" style="display: none;">  Be part of our <span class="esrc-bold">142356</span> members  </div>  <div class="esrc-popup-action">    <a target="_blank" href="https://www.facebook.com/groups/929830964974849/" class="esrc-popup-btn">Join now</a>  </div></div><div class="esrc-shadow-box" id="esrc-shadow-box"></div><style>:root{  --btn-bg-color: #03E5BA;  --btn-color: #000;  --padding: 3.5%;  --title-size: 40px;  --txt-color: #111111;  --txt-info-color: #ddd;  --txt-info-color2: #777;  --padding-m: 24px;}.esrc-time-item.esrc-time-divc{  width: 10%;}.esr-time-txt{  margin-top: 6px;}.esrc-point{  background-color: #fff;  height: 10px;  width: 10px;  border-radius: 50%;  margin-bottom: 10px;}.esrc-time-block{  display: flex;}.w-time{  width: 100%;  background-color: #fff;  border-radius: 6px;  margin-right: 5px;  color: #000;  padding: 4px 6px;}.esrc-time-item{  width: 28%;  text-align: center;}.esr-time-div{  font-size: 1.4rem;  text-align: center;  width: 10px;  margin: 0 auto;  padding-top: 13px;}.esrc-time-number{  font-size: 2.4rem;}.esr-time-txt{  font-size: 12px;  color: #000;}.esrc-time-box{  display: flex;  width: 100%;  border-radius: 4px;  bottom: 33%;  left: 16.4%;  padding: 10px;  color: #fff;}.z-form-1 .z-btn.esrc-btn-cash{  position: relative;  bottom: 0;  left: 0;  padding-left: 20px;  padding-right: 20px;  background-color: #fff;  display: block;  text-align: center;}.z-bold{  font-weight: bold;  font-family: "Montserrat-Bold";}.z-form-3-inner .z-cat-box .z-btn.z-btn-cat{  bottom: -50px;}.z-pre-bold{  font-weight: bold;  text-align: center;}.z-cat-box .z-btn.z-btn-cat{  bottom: -30px;}.z-btn.z-btn-cat{  position: absolute;  bottom: 60px;  left: 60px;  padding-left: 6vw;  padding-right: 6vw;}.z-nav a:hover{  color: #fff;}.z-m{  display: none;}.z-form-1-title{  color: var(--btn-color);  font-size: 24px;  margin-bottom: 10px;}.z-form-1-info{  color: var(--txt-color);  font-size: 16px;  margin-bottom: 24px;}.z-form-2-info{  margin-bottom: 20px;  color: var(--txt-info-color);}.z-form-1 button{  background-color: #fff !important;}.z-form-3-inner form{  margin-left: 0px !important;}.z-form-1{  position: absolute;  bottom: 10%;  left: 8%;  background-color: var(--btn-bg-color);  width: 27%;  padding: 20px;  border-radius: 10px;  max-width: 400px;}.z-faq-info{  padding-top: 16px;  padding-bottom: 30px;  display: none;  color: var(--txt-info-color2);}.z-faq-item{  background: rgba(161, 161, 162, 15%);  padding: 30px;  border-radius: 15px;  margin-bottom: 20px;}.z-faq-item.active .z-faq-info{  display: block;}.z-faq-item.active .z-faq-title{  display: block;  border-bottom: 1px solid #777;  padding-bottom: 16px;}.z-faq-icon{  width: 50px;  height: 50px;  position: absolute;  top: -8px;  right: 0;  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/grommet-icons_form-down.png");  cursor: pointer;}.z-faq-icon.active{  transform: rotate(-90deg);}.z-faq-title{  font-size: 24px;  position: relative;  padding-right: 50px;  }.z-faq-list{  padding-left: 40%;}.z-faq-top-title{  font-size: 50px;}.z-faq{  color: #fff;  padding-left: var(--padding);  padding-right: var(--padding);  margin-top: 80px;}.z-primary-text{  color: var(--btn-bg-color);}.z-form-3-inner{  position: absolute;  top: 50%;  transform: translateY(-50%);  width: 80%;  max-width: 500px;  text-align: left;}.z-form-3-txt{  width: 50%;  color: #fff;  position: relative;  padding-left: 50px;}.z-form-3-img{  padding-top: 42%;  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame-8868.png");  width: 50%;}.z-form-3{  display: flex;  padding-left: var(--padding);  padding-right: var(--padding);  margin-top: 80px;}.esrc-popup-close{  position: absolute;  right: -30px;  top: 10px;  cursor: pointer;}.esrc-popup-close-box{  position: relative;  height: 40px;}.esrc-popup-action{  margin-top: 20px;}.esrc-charging-item-time{  padding-left: 20px;  line-height: 27px;  color: #dee2ea;}.esrc-popup-btn{  display: inline-block;  border-radius: 20px;  padding: 8px 60px;  color: #fff;  background-image: linear-gradient(to right, #5894e3, #4783cf);}a.esrc-popup-btn:hover{  color: #fff;}.esrc-bold{  font-weight: bold;}.esrc-popup-title{  font-size: 1.6rem;  color: #3c80da;  font-weight: bold;}.esrc-popup-code{  background-image: url("https://static.esrgear.com/wp-content/uploads/2023/06/esrc-popup-bg.png");  height: 41.2px;  line-height: 41.2px;  padding-left: 20px;  width: 80%;  margin: 0 auto;}.esrc-popup-info{  margin-top: 20px;  color: #666;  margin-bottom: 20px;  font-size: 1.4rem;}.esrc-form-callback{  width: 640px;  background-color: #fff;  border-radius: 10px;  padding: 40px;  padding-top: 0px;  position: fixed;  text-align: center;  top: 20%;  left: 0;  right: 0;  margin: 0 auto;  z-index: 223;  display: none;}.esrc-form-callback.active{  display: block;}.esrc-shadow-box.active{  display: block;}.esrc-shadow-box{  position: fixed;  top: 0;  left: 0;  width: 100%;  height: 100vh;  background-color: #000;  z-index: 222;  opacity: 0.7;  display: none;}.z-form-2-title{  font-size: var(--title-size);  margin-bottom: 10px;}.z-form-2-txt{  width: 60%;  margin: 0 auto;  text-align: center;  margin-bottom: 20px;}.z-form-2{  padding: 40px;  color: #fff;  margin-top: 30px;  margin-bottom: 50px;  position: relative;}.z-form-2 .z-cat-box{  text-align: center;}.z-form-2 .z-btn.z-btn-cat{  position: relative;  left: 0;}div{  box-sizing: border-box;}.z-footer{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Footer33333.png");  padding-top: 38%;}.z-slider{  width: 100%;  white-space: nowrap;  overflow: hidden;  font-size: 0;}.z-wallet{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame-55.png");  height: 16vw;  width: 60%;  display: inline-block;  animation: slider-move 20s linear infinite;}@keyframes slider-move{  %0 {    transform: translateX(0);  }  100% {    transform: translateX(-100%);  }}.icon-1{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame11-1.png");}.icon-2{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/icon-2222.png");}.icon-3{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame11-3.png");}.icon-4{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame11-4.png");}.icon-5{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/icon-5555.png");}.icon-6{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame11-6.png");}.icon-7{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame11-7.png");}.z-multi-icon{  width: 40px;  height: 40px;  margin-right: 16px;  cursor: pointer;}.z-multi-icon:last-child{  margin-right: 0;}.z-multi-action{  width: 480px;  height: 80px;  background: rgba(30, 30, 30, 15%);  margin: 0 auto;  display: flex;  text-align: center;  align-items: center;  justify-content: center;  border-radius: 70px;}.z-multi-img-item img{  width: 40%;  align-items: center;}.z-multi-img-item{  display: none;  text-align: center;  padding: 40px;}.z-multi-img-item.active{  display: block;}.z-multi-img-list{  width: 80%;  margin: 0 auto;}.z-multi-title{  font-size: var(--title-size);  margin-bottom: 10px;}.z-multi-txt-box{  text-align: center;  width: 98%;  margin: 0 auto;  max-width: 800px;}.z-multi{  background-color: #A1A1A2;  padding: 40px 60px;}.z-anti{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/design-Highlights-1.png");  padding-top: 44%;}.z-large-2{  padding-left: var(--padding);  padding-right: var(--padding);}.z-large-2-inner{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/v2-image-1.png");  padding-top: 62%;}.z-large-3{  padding-left: var(--padding);  padding-right: var(--padding);  margin-top: 20px;}.z-large-3-inner{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame-66-1.png");  padding-top: 11%;}.z-so{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/07/design-Feature-2-Slim.png");  padding-top: 58%;}.z-large{  padding-left: var(--padding);  padding-right: var(--padding);}.z-large-inner{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame-37-1-1.png");  padding-top: 18%;}.z-sound{  padding-left: var(--padding);  padding-right: var(--padding);  margin-top: 40px;}.z-sound-inner{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame-32-2.png");  padding-top: 54.8%;}.z-easy{  padding-left: var(--padding);  padding-right: var(--padding);  margin-top: 40px;}.z-easy-inner{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame-6637.png");  padding-top: 22%;}.z-meet{  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/introduction-1.png");  padding-top: 58%;}.z-rev-inner{  padding-top: 62%;  width: 100%;  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame-34-1.png");}.z-rev{  padding: 40px;  position: relative;}.z-nav-item{  color: #fff;  width: 33%;  text-align: center;  cursor: pointer;}.z-nav{  display: flex;  background: rgba(0, 0, 0, 50%);  margin-left: 2%;  margin-right: 2%;  border-radius: 6px;  padding-left: 4%;  padding-right: 4%;}.z-font{  color: var(--btn-color);}.z-container a{  text-decoration: none;}.z-bg{  background-color: #000;}.z-btn{  padding: 0.7vw 20px;  border-radius: 10px;  background-color: var(--btn-bg-color);  font-size: 16px;  display: inline-block;  cursor: pointer;}.z-header{  display: flex;  width: 90%;  margin: 0 auto;  position: sticky;  top: 0;  z-index: 2;}.z-logo{  width:35%;  background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/log55555o.png");  height: 2vw;}.z-nav{  width: 45%;  vertical-align: center;  justify-content: center;  align-items: center;}.z-preorder{  justify-content: right;  align-items: center;}.z-container{  padding-top: 10px;  padding-bottom: 10px;}.font-r{  font-family: "Montserrat-Regular";}.font-l{  font-family: "Montserrat-Light";}.font-b{  font-family: "Montserrat-Bold";}.font-m{  font-family: "Montserrat-Medium";}.z-img{  background-position: center;  background-repeat: no-repeat;  background-size: cover;}@media screen and (max-width: 768px){  .z-nav{    display: none;  }  .z-multi{    padding: 40px;  }  .z-multi-icon:nth-child(7){    margin-right: 0;  }  .z-multi-img-item img{    width: 80%;  }  .z-btn.z-btn-cat{    position: relative;    padding-left: 0;    padding-right: 0;    bottom: -20px;    width: 100%;    left: 0;    box-sizing: border-box;    text-align: center;    margin-bottom: 30px;  }  .z-rev{    padding-left: var(--padding-m);    padding-right: var(--padding-m);  }  .z-faq{    color: #fff;    padding-left: var(--padding);    padding-right: var(--padding);    margin-top: 80px;  }  .z-preorder{    width: 40%;    text-align: right;    margin-top: -4px;  }  .z-form-2-title{    font-size: 32px;  }  .z-header .z-btn{    padding: 8px 14px;    border-radius: 8px;    font-size: 12px;  }  .z-btn{    padding: 9px 20px;    border-radius: 14px;      }  .z-logo{    width: 220px;    height: 14px;    margin-top: 4px;  }  .z-header{    width: 100%;    background: rgba(161, 161, 162, 15%);    padding: 24px;  }  .z-footer{    background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Footer-4444.png");    padding-top: 204%;    margin-top: 60px;  }  .z-form-3-txt{    width: 100%;    padding-left: 0;    margin-top: 36px;  }  .z-form-3-inner{    position: relative;    top: 0;    transform: unset;    width: 100%;  }  .z-form-3-img{    width: 100%;    background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame-68-m.png");    padding-top: 88%;  }  .z-form-3{    display: block;  }  .z-wallet{    background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame-55.png");    padding-top: 16%;    margin-top: 60px;    margin-bottom: 0;  }  .z-faq-icon{    width: 24px;    height: 24px;    top: 0;  }  .z-faq-info{    font-size: 16px;    padding-bottom: 0;  }  .z-faq-title{    font-size: 18px;  }  .z-faq-item{    padding: 24px;  }  .z-faq-list{    padding-left: 0;    margin-top: 40px;  }  .z-multi-action{    width: 100%;    margin-top: 40px;    height: 40px;  }  .z-multi-icon{    width: 24px;    height: 24px;  }  .z-multi-icon:last-child{    margin-right: 0;  }  .z-multi-info{    margin-top: 40px;    margin-bottom: 40px;  }  .z-multi-txt-box{    width: 100%;  }  .z-form-2-txt{    width: 100%;  }  .z-form-2{    width: 100%;  }  .z-anti{    background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/design-Highlights-1-1.png");    padding-top: 300%;  }  .z-large{    background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/design-Feature-1-Find-my-2.png");    padding-top: 210%;  }  .z-so{    background-image: url("https://static.esrgear.com/wp-content/uploads/2024/07/design-Feature-2-Slim-hhh.png");    padding-top: 200%;    margin-top: 60px;  }  .z-m-desc{    color: #fff;  }  .z-m-title{    font-size: 44px;    margin-bottom: 32px;    margin-top: 80px;  }  .z-m-info{    font-size: 20px;    margin-bottom: 40px;    color: #ddd;  }  .z-meet-m-img{    background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame-32-1.png");    padding-top: 282.5%;  }  .z-meet-m{    padding-left: var(--padding-m);    padding-right: var(--padding-m);  }  .z-meet{    background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/introduction-1-1.png");    padding-top: 210%;  }  .z-rev-m-title1{    font-size: 28px;  }  .z-rev-m-title2{    font-size: 54px;    line-height: 1;    margin-top: 20px;    margin-bottom: 20px;    text-transform: uppercase;  }  .z-rev-m{    color: #fff;  }  .z-rev-m-img{    background-image: url("https://static.esrgear.com/wp-content/uploads/2024/06/Frame-57.png");    padding-top: 106%;  }  .z-m{    display: block;  }  .z-pc{    display: none;  }  .z-form-1{    position: relative;    width:100%;    left: 0;    margin-top: 20px;    border-radius: 18px;    max-width: 100%;  }}</style><script src="https://static.esrgear.com/wp-includes/js/jquery/jquery.js?ver=1.12.4"></script><script>jQuery(function($){    var product_id = typeof crowd_product_id != "undefined" ? crowd_product_id : 0;      var variation_id = typeof crowd_variation_id != "undefined" ? crowd_variation_id : 0;      var isloading = false;      $(".esrc-btn-cash").on("click", function(){      location.href = "https://www.kickstarter.com/projects/esrgear/worlds-1st-wallet-with-built-in-find-my";      return ;      if(product_id <= 0){        return false;      }          let data = {              attribute_color: "Silver-1 Set",              quantity: 1,              product_id: variation_id,              variation_id: variation_id          };          if(isloading){              return ;          }          isloading = true;          $.ajax({              url: "/?wc-ajax=add_to_cart",              type: "POST",              data: data,              success: function(res){                  if(res.length == 0 || typeof res.cart_hash != "undefined"){                      location.href = "/checkout";                  }              }          })      });      $(".z-multi-icon").on("click", function(){    const $this = $(this);    const id = $this.data("id");    $(".z-multi-img-item").removeClass("active");    $("#z-img-item-" + id).addClass("active");  });    window.addEventListener("klaviyoForms", function(e) {    if (e.detail.type == "submit") {      $("#esrc-form-callback").addClass("active");      $("#esrc-shadow-box").addClass("active");    }  });    $("#esrc-popup-close-btn").on("click", function(){    $("#esrc-form-callback").removeClass("active");    $("#esrc-shadow-box").removeClass("active");  });    $(".z-faq-icon").on("click", function(){    const $this = $(this);    $this.toggleClass("active");    $this.parents(".z-faq-item").toggleClass("active");  });    var zc_countDown = function(year, month, day, hour, count_hour) {      var now = new Date();      let end_date = new Date(year, month - 1, day, hour);      var diff = end_date.getTime() - now.getTime();      if (diff <= 0) {        return 0;      }      var leftd, lefth, leftm;        leftd = Math.floor(diff / (1000*60*60*24));           lefth = Math.floor(diff / (1000*60*60) %24);            leftm = Math.floor(diff / (1000*60)%60);       /*          lefts = Math.floor(lefttime/1000%60);  //计算秒数        return leftd + "天" + lefth + ":" + leftm + ":" + lefts;  //返回倒计时的字符串        $("#esrc-time-day").html(leftd);      $("#esrc-time-hour").html(lefth);      $("#esrc-time-minute").html(leftm);      */      const zreo = 0;      if(leftd > 9){        let d1 = Math.floor(leftd / 10);        let d2 = leftd % 10;        $("#w-d1").html(d1);        $("#w-d2").html(d2);      }else{        $("#w-d1").html(zreo);        $("#w-d2").html(leftd);      }            console.log(lefth);      if(lefth > 9){        let h1 = Math.floor(lefth / 10);        let h2 = lefth % 10;        $("#w-h1").html(h1);        $("#w-h2").html(h2);      }else{        $("#w-h1").html(zreo);        $("#w-h2").html(lefth);      }            if(leftm > 9){        let m1 = Math.floor(leftm / 10);        let m2 = leftm % 10;        $("#w-m1").html(m1);        $("#w-m2").html(m2);      }else{        $("#w-m1").html(zreo);        $("#w-m2").html(leftm);      }      /*      let second = parseInt(diff / 1000);      if (count_hour != null) {        let hours = Math.ceil(second / (60 * 60));        return hours;      }      let days = Math.ceil(second / (60 * 60 * 24));      return days;      */    };    let year = 2024,      month = 7,      day = 23,      hour = 19;    let days = zc_countDown(year, month, day, hour);      setInterval(function(){      zc_countDown(year, month, day, hour);    }, 1000);});</script>';
    $variables = [
    "metaobject" => [
        "type" => "lookbook",
        "handle" => "winter-2023",
        "fields" => [["key"=>"hex", "value"=> $html]],
    ],
    ];

    $response = $client->query(["query" => $query, "variables" => $variables]);
    $body = $response->getDecodedBody();
    error_log(print_r($body, true) . "\r\n", 3, 'debug.log');


    // query metaobjectDefinitions
    $query = <<<QUERY
    query{
        metaobjectDefinitions(first: 5) {
            edges{
                node{
                    id
                    name
                }
            }
        }
    }
    QUERY;
    // $response = $client->query(["query" => $query]);
    // $body = $response->getDecodedBody();
    // error_log(print_r($body, true) . "\r\n", 3, 'debug.log');


    // query metaobjects
    $query = <<<QUERY
    query{
        metaobjects(type: "lookbook" first: 5) {
            edges{
                node{
                    id
                    fields{
                        key
                        type
                        value
                    }
                }
            }   
        }
    }
    QUERY;
    // $response = $client->query(["query" => $query]);
    // $body = $response->getDecodedBody();
    // error_log(print_r($body, true) . "\r\n", 3, 'debug.log');


    // query metafieldDefinitions
    $query = <<<QUERY
        query{
            metafieldDefinitions(first: 250, ownerType: PRODUCT) {
                edges {
                    node {
                        id
                    }
                }
            }
        }
    QUERY;
   // $response = $client->query(["query" => $query]);
   // $body = $response->getDecodedBody();
   // error_log(print_r($body, true) . "\r\n", 3, 'debug.log');


    return response($result->getDecodedBody());
})->middleware('shopify.auth');

Route::post('/api/metaobjects', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active
    error_log(print_r($session, true) . "\r\n", 3, 'debug.log');
    $client = new Rest($session->getShop(), $session->getAccessToken());
    $result = $client->get('products/count');

    return response($result->getDecodedBody());
})->middleware('shopify.auth');


Route::post('/api/products', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $success = $code = $error = null;
    try {
        ProductCreator::call($session, 5);
        $success = true;
        $code = 200;
        $error = null;
    } catch (\Exception $e) {
        $success = false;

        if ($e instanceof ShopifyProductCreatorException) {
            $code = $e->response->getStatusCode();
            $error = $e->response->getDecodedBody();
            if (array_key_exists("errors", $error)) {
                $error = $error["errors"];
            }
        } else {
            $code = 500;
            $error = $e->getMessage();
        }

        Log::error("Failed to create products: $error");
    } finally {
        return response()->json(["success" => $success, "error" => $error], $code);
    }
})->middleware('shopify.auth');

Route::post('/api/webhooks', function (Request $request) {
    try {
        $topic = $request->header(HttpHeaders::X_SHOPIFY_TOPIC, '');

        $response = Registry::process($request->header(), $request->getContent());
        if (!$response->isSuccess()) {
            Log::error("Failed to process '$topic' webhook: {$response->getErrorMessage()}");
            return response()->json(['message' => "Failed to process '$topic' webhook"], 500);
        }
    } catch (InvalidWebhookException $e) {
        Log::error("Got invalid webhook request for topic '$topic': {$e->getMessage()}");
        return response()->json(['message' => "Got invalid webhook request for topic '$topic'"], 401);
    } catch (\Exception $e) {
        Log::error("Got an exception when handling '$topic' webhook: {$e->getMessage()}");
        return response()->json(['message' => "Got an exception when handling '$topic' webhook"], 500);
    }
});
