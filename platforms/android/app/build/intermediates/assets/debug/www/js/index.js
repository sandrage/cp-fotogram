let session_id=null;
let username_logged=null;
let followed_friends={};
let response_mapping = {
  'CANNOT FOLLOW YOURSELF':"You can't follow yourself",
  'ALREADY FOLLOWING USER':"You are already following that user",
  'USERNAME NOT FOUND':"The username doesn't exists",
  'YOU ARE NOT FOLLOWING THAT USER':"You are already not following that user"
}
$(document).ready(function(){
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
function formatdate(date){
  return date.getDate()+"-"+date.getMonth()+"-"+date.getYear()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}
function errormanager(error, msg){
  if(error.status==401){
    localStorage.removeItem("session_id");
    localStorage.removeItem("username");
    alert('Invalid session id'+"("+msg+")");
  } else{
    if(response_mapping[error.responseText]){
      alert(response_mapping[error.responseText]+"("+msg+")");
    } else{
      alert('Unexpected error: '+error.responseText+"("+msg+")");
    }
  }
}
function togglelogin(e){
  $('#app-content').hide();
  $('#loginpage').show();
}
function togglehome(e){
  $('#dashboardpage').show(followed);
  $('#postcreationpage').hide();
  $('#profilepage').hide();
  $('#searchpage').hide();
  $('#changeprofilephotopage').hide();
}
function toggleprofile(e){
  $('#dashboardpage').hide();
  $('#postcreationpage').hide();
  $('#profilepage').show(function(){profile(e)});
  $('#searchpage').hide();
  $('#changeprofilephotopage').hide();
}
function toggleaddpost(e){
  $('#dashboardpage').hide();
  $('#postcreationpage').show(postcreation);
  $('#profilepage').hide();
  $('#searchpage').hide();
  $('#changeprofilephotopage').hide();
}
function togglesearch(e){
  $('#dashboardpage').hide();
  $('#postcreationpage').hide();
  $('#profilepage').hide();
  $('#searchpage').show(searchusers);
  $('#changeprofilephotopage').hide();
}
function toggleprofilephoto(){
  $('#changeprofilephotopage').show(updatephoto);
  $('#dashboardpage').hide();
  $('#postcreationpage').hide();
  $('#profilepage').hide();
  $('#searchpage').hide();
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
      errormanager(error,"login");
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
      let posts = response.posts;
      posts.forEach(function(elem){
        let dateFormatted = formatdate(new Date(elem.timestamp));
        let newcard = '<div class="shadow card mx-auto cardstyle" onclick="toggleprofile(\''+elem.user+'\')">'
              +'<div class="card-body">'
                +'<div class="card-header row nopadding nomargin">'
                  +'<div class="col-xs-4 text-left">'
                    +'<img width="100" height="100" class="rounded-circle" src="data:image/png;base64,'+followed_friends[elem.user]+'"/>'
                  +'</div>'
                  +'<div class="col-xs-8 align-top text-left mb-10">'
                    +'<div class="row">'
                      +'<div class="col usernamestyle">'+elem.user+"</div>"
                    +'</div>'
                    +'<div class="row">'
                    +"<span><i class='material-icons md-18'>arrow_forward_ios</i></span> <p class='msgstyle'>"+elem.msg+"</p>"
                    +'</div>'
                  +'</div>'
                +'</div>'
              +'</hr>'
              +'<div class="list-group list-group-flush row">'
                +'<div class="list-group-item col nopadding">'
                  +'<img class="img-max-width" src="data:image/png;base64,'+elem.img+'"/>'
                +'</div>'
              +'</div>'
              +'<div class="list-group list-group-flush row">'
                +'<div class="list-group-item col">'
                  +'<p class="timestampstyle">'+dateFormatted+'</p>'
                +'</div>'
              +'</div>'
            +'</div>'
          +'</div>';
        $('#dash-content').append(newcard);
      });
    },
    error: (error) => {
      errormanager(error,"dashboard");
    }
  });
}
function onFail(message){
  alert('Unexpected error occured while in the image upload: '+message);
}
function postcreation(e){
  $('#imgpreview').empty();
  $('#addpost').submit(addpostsubmit);
  $('#postimg').click(function(){
    navigator.camera.getPicture(resizePhoto, onFail, {quality: 25, destinationType: Camera.DestinationType.DATA_URL, sourceType: Camera.PictureSourceType.PHOTOLIBRARY});
  });
}
function resizePhoto(imageData){
  var img = document.createElement("img");
  var canvas = document.createElement("canvas");
  img.onload = function(){
    var MAX_WIDTH = 300;
    var MAX_HEIGHT = 200;
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
function resizeProfilePhoto(imageData){
  var img = document.createElement("img");
  var canvas = document.createElement("canvas");
  img.onload = function(){
    var MAX_WIDTH = 100;
    var MAX_HEIGHT = 200;
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
      $('#profileimgpreview').append(imgresized);
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
      //$('#addpost').prepend('<div class="alert alert-danger" role="alert">Something went wrong while uploading the post :(</div>');
      errormanager(error,"addpost");
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
      errormanager(error);
    }
  });
}
function updatephoto(){
  $('#profileimgpreview').empty();
  $('#changephoto').submit(changephotosubmit);
  $('#profileimg').click(function(){
    navigator.camera.getPicture(resizeProfilePhoto, onFail, {quality: 25, destinationType: Camera.DestinationType.DATA_URL, sourceType: Camera.PictureSourceType.PHOTOLIBRARY});
  })
}
function changephotosubmit(){
  e.preventDefault();
  e.stopPropagation();
  const profileimage = $('#profileimgpreview')[0].src.replace(/^data:image.+;base64,/, '');
  var data = new FormData();
  data.append("session_id",session_id);
  data.append("picture",profileimage);
  $.ajax({
    url: base_url+'picture_update',
    method: 'post',
    data: data,
    processData: false,
    contentType: false,
    success: (response) => {
      toggleprofile(localStorage.getItem('username'));
    },
    error: (error) =>{
      errormanager(error,"picture_update");
    }
  });
}
function profile(e){
  $('#profile_posts_content').empty();
  $('#userprofilephoto').empty();
  $('#go_follow').unbind('click');
  $('#go_unfollow').unbind('click');
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
      profilephoto.width = 100;
      profilephoto.height = 100;
      profilephoto.id = 'photo'+response.username;
      console.log("response: ",response.username);
      console.log("localStorage: ",localStorage.getItem("username"))
      profilephoto.onload = function(){
        profilephoto.onclick=toggleprofilephoto;
        $('#userprofilephoto').append(profilephoto);
      };

      profilephoto.src = 'data:image/png;base64,'+response.img;
      $('#profile_user').html(response.username);
      if(response.posts!=null){
        response.posts.forEach(function(elem){
          let dateFormatted = formatdate(new Date(elem.timestamp));
          let newcard = '<div class="shadow card mx-auto cardstyle">'
                +'<div class="card-body">'
                  +'<div class="card-header row nopadding nomargin">'
                    +'<div class="col align-top text-left">'
                      +"<p class='msgstyle'><span><i class='material-icons md-18'>arrow_forward_ios</i></span>"+elem.msg+"</p>"
                    +'</div>'
                  +'</div>'
                +'</hr>'
                +'<div class="list-group list-group-flush row">'
                  +'<div class="list-group-item col nopadding">'
                    +'<img class="img-max-width" src="data:image/png;base64,'+elem.img+'"/>'
                  +'</div>'
                +'</div>'
                +'<div class="list-group list-group-flush row">'
                  +'<div class="list-group-item col">'
                    +'<p class="timestampstyle">'+dateFormatted+'</p>'
                  +'</div>'
                +'</div>'
              +'</div>'
            +'</div>';
          $('#profile_posts_content').append(newcard);
        });
      }
    },
    error: (error) => {
      errormanager(error,"follow");
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
      alert('Now you are following this user!');
    },
    error: (error) =>{
      errormanager(error,"follow");
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
      alert('You are not following that user anymore');
    },
    error: (error) =>{
      errormanager(error,"unfollow");
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
      errormanager(error);
    }
  });
}
function followed(){
  var data = new FormData();
  data.append('session_id',localStorage.getItem("session_id"));
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
      errormanager(error, "followed");
    }
  });
}
