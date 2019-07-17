let session_id=null;
let username_logged=null;
let followed_friends={};
$(document).ready(function(){
  followed();
  session_id = localStorage.getItem("session_id");
  username_logged = localStorage.getItem("username");
  if(session_id!=null && username_logged!=null){
    $('#app-content').show(togglehome);
  } else{
    $('#loginpage').show();
  }
  $('#login-form').submit(login);
  $('#menu-home').click(togglehome);
  $('#menu-profile').click(function(){toggleprofile(username_logged)});
  $('#menu-addpost').click(toggleaddpost);
  $('#menu-search').click(togglesearch);
  $('#logout').click(logout);
});
function togglelogin(e){
  $('#app-content').hide();
  $('#loginpage').show();
}
function togglehome(e){
  $('#dashboardpage').show(followed);
  $('#postcreationpage').hide();
  $('#profilepage').hide();
  $('#searchpage').hide();
}
function toggleprofile(e){
  $('#dashboardpage').hide();
  $('#postcreationpage').hide();
  $('#profilepage').show(function(){profile(e)});
  $('#searchpage').hide();
}
function toggleaddpost(e){
  $('#dashboardpage').hide();
  $('#postcreationpage').show(postcreation);
  $('#profilepage').hide();
  $('#searchpage').hide();
}
function togglesearch(e){
  $('#dashboardpage').hide();
  $('#postcreationpage').hide();
  $('#profilepage').hide();
  $('#searchpage').show(searchusers);
}
function login(e){
  e.preventDefault();
  e.stopPropagation();
  const username = $('#login-form input[name="username"]').val();
  const password = $('#login-form input[name="password"]').val();
  let data = new FormData();
  data.append("username",username);
  data.append("password",password);
  $.ajax({
    url: base_url+'login',
    method: 'post',
    data: data,
    processData: false,
    contentType: false,
    success: (response)=>{
      session_id = response;
      localStorage.setItem("session_id",session_id);
      username_logged = username;
      localStorage.setItem("username",username_logged);
      $('#loginpage').hide();
      $('#app-content').show(togglehome);
    },
    error: (error)=>{
      localStorage.removeItem("session_id");
      localStorage.removeItem("username");
      $('#fotogram-logo').after('<div class="alert alert-danger" role="alert">Wrong username or password!</div>');
    }
  });
}
function dashboard(e){
  $('#dash-content').empty();
  let data = new FormData();
  data.append("session_id",session_id);
  $.ajax({
    url: base_url+'wall',
    method: 'post',
    data: data,
    dataType: 'json',
    processData: false,
    contentType: false,
    success: (response) => {
      console.log(response);
      let posts = response.posts;
      posts.forEach(function(elem){
        let newcard = '<div class="card mx-auto" style="max-width: 400px;">';
        newcard+='<div class="card-header">';
        newcard+='<div class="col-20"><img style="margin-right:20px" width="100" height="100" class="rounded-circle" src="data:image/png;base64,'+followed_friends[elem.user]+'"/></div>'
        newcard+=elem.user;
        newcard+='</div>';
        newcard+='<div class="card-body">';
        newcard+=elem.msg+"</div>";
        newcard+='<img class="img-max-width" src="data:image/png;base64,'+elem.img+'"/>';
        newcard+='<div class="card-footer text-muted mb-4 mx-auto" style="width: 400px;">';
        newcard+=elem.timestamp;
        newcard+='</div>';
        newcard+='</div>';
        $('#dash-content').append(newcard);
      });
    },
    error: (error) => {
      $('#header').after('<div class="alert alert-danger" role="alert">Error in content loading</div>');
    }
  });
}
function onFail(message){
  alert('Failed because: '+message);
}
function postcreation(e){
  $('#addpost').submit(addpostsubmit);
  $('#postimg').click(function(){
    navigator.camera.getPicture(resizePhoto, onFail, {quality: 25, destinationType: Camera.DestinationType.DATA_URL});
  });
}
function resizePhoto(imageDate){
  var img = document.createElement("img");
  var canvas = document.createElement("canvas");
  img.onload = function(){
    var MAX_WIDTH = 400;
    var MAX_HEIGHT = 300;
    var width = img.width;
    var height = img.height;
    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    var dataurl = canvas.toDataURL(postimg.type);
    var imgresized = document.createElement("img");
    imgresized.id = 'imgresized';
    imgresized.onload = function(){
      $('#imgpreview').append(imgresized);
    };
    imgresized.src = dataurl;
  };
  img.src = "data:image/jpeg;base64," + imageData;
}
function addpostsubmit(e){
  e.preventDefault();
  e.stopPropagation();
  const postmsg = $('#addpost input[name="postmsg"]').val();
  const postimg = $('#imgresized')[0].src.replace(/^data:image.+;base64,/, '');
  var data = new FormData();
  data.append("session_id",session_id);
  data.append("img",postimg);
  data.append("message",postmsg);
  $.ajax({
    url: base_url+'create_post',
    method: 'post',
    data: data,
    processData: false,
    contentType: false,
    success: (response) => {
      togglehome();
    },
    error: (error) =>{
      $('#addpost').prepend('<div class="alert alert-danger" role="alert">Something went wrong :(</div>');
    }
  });
}
function searchusers(e){
  $('#searchfield').on('input',getlistusers);
}
function getlistusers(e){
  var initial=$('#searchfield').val();
  var data = new FormData();
  data.append('session_id',session_id);
  data.append('usernamestart',initial);
  data.append('limit',10);
  $.ajax({
    url: base_url+'users',
    method: 'post',
    data: data,
    processData: false,
    contentType: false,
    dataType: 'json',
    success: (response) => {
      var users = response.users;
      var list = $('#list-users');
      users.forEach(function(elem){
        list.append('<li class="list-group-item" onclick="toggleprofile(\''+elem.name+'\')"><img style="margin-right:20px" class="rounded-circle" width="50" height="50" src="data:image/png;base64,'+elem.picture+'"/>'+elem.name+'</li>');
      });
    },
    error: (error) => {

    }
  });
}
function profile(e){
  console.log(e);
  $('#go_follow').click(function(){actionfollow(e)});
  $('#go_unfollow').click(function(){actionunfollow(e)});
  var data = new FormData();
  data.append('session_id',session_id);
  data.append('username',e);
  $.ajax({
    url: base_url+'profile',
    method: 'post',
    data: data,
    dataType: 'json',
    processData: false,
    contentType: false,
    success: (response) => {
      var profilephoto = document.createElement('img');
      profilephoto.classList.add('rounded-circle');
      profilephoto.onload = function(){
        $('#userprofilephoto').empty();
        $('#userprofilephoto').append(profilephoto);
      };
      profilephoto.width = 100;
      profilephoto.height = 100;
      profilephoto.src = 'data:image/png;base64,'+response.img;
      $('#profile_user').html(response.username);
      if(response.posts!=null){
        $('#profile_posts_content').empty();
        response.posts.forEach(function(elem){
          let newcard = '<div class="card" style="max-width: 400px;">';
          newcard+='<div class="card-body">';
          newcard+='<p class="card-text">'+elem.msg+'</div>';
          newcard+='<img class="img-max-width" src="data:image/png;base64,'+elem.img+'"/>';
          newcard+='</div>';
          newcard+='<div class="card-footer text-muted mb-4" style="max-width: 400px;">';
          newcard+=elem.timestamp;
          newcard+='</div>';
          newcard+='</div>';
          $('#profile_posts_content').append(newcard);
        });
      }
    },
    error: (error) => {

    }
  });
}
function actionfollow(e){
  var data = new FormData();
  data.append('session_id',session_id);
  data.append('username',e);
  $.ajax({
    url: base_url+'follow',
    method: 'post',
    data: data,
    processData: false,
    contentType: false,
    success: (response) => {
      console.log(response);
    },
    error: (error) =>{
      if(error.responseText){
        alert(error.responseText);
      }
    }
  });
}
function actionunfollow(e){
  var data = new FormData();
  data.append('session_id',session_id);
  data.append('username',e);
  $.ajax({
    url: base_url+'unfollow',
    method: 'post',
    data: data,
    processData: false,
    contentType: false,
    success: (response) => {
      console.log(response);
    },
    error: (error) =>{
      console.log(error);
      if(error.responseText){
        alert(error.responseText);
      }
    }
  });
}
function logout(){
  var data = new FormData();
  data.append('session_id',session_id);
  $.ajax({
    url: base_url+'logout',
    method: 'post',
    data: data,
    processData: false,
    contentType: false,
    success: (response) => {
      localStorage.removeItem("session_id");
      localStorage.removeItem("username");
      togglelogin();
    },
    error: (error) => {
      if(error.responseText){
        alert(error.responseText);
      }
    }
  });
}
function followed(){
  var data = new FormData();
  data.append('session_id',session_id);
  $.ajax({
    url: base_url+'followed',
    method: 'post',
    data: data,
    dataType: 'json',
    processData: false,
    contentType: false,
    success: (result) =>{
      var users = result.followed;
      followed_friends={};
      users.forEach(function(elem){
        followed_friends[elem.name]=elem.picture;
      });
      dashboard();
    },
    error: (error) => {

    }
  });
}
