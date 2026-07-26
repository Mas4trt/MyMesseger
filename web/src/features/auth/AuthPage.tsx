import React, { useState } from 'react';
import { AuthAPI } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Turnstile } from '@marsidev/react-turnstile';
import { CONFIG } from '../../config/constants';
import '../../assets/css/auth.css';


type AuthMode = 'login' | 'register';


export const AuthPage: React.FC = () => {


  const [mode, setMode] = useState<AuthMode>('login');

  const [isLoading,setIsLoading] = useState(false);

  const [captchaToken,setCaptchaToken] = useState('');



  const { login } = useAuth();

  const { toast } = useToast();



  const [formData,setFormData] = useState({

    email:'',
    displayName:'',
    username:'',
    password:'',

    birthDay:'',
    birthMonth:'',
    birthYear:''

  });



  const handleModeSwitch=(newMode:AuthMode)=>{

    setMode(newMode);

    setCaptchaToken('');

    setFormData(prev=>({

      ...prev,

      password:''

    }));

  };




  const handleChange=(
    e:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  )=>{

    setFormData(prev=>({

      ...prev,

      [e.target.name]:e.target.value

    }));

  };





  const handleSubmit=async(
    e:React.FormEvent
  )=>{


    e.preventDefault();



    if(
      !formData.username ||
      !formData.password
    ){

      toast.warning(
        'Заполните обязательные поля'
      );

      return;

    }



    if(
      mode==='register' &&
      !captchaToken
    ){

      toast.warning(
        'Пройдите проверку'
      );

      return;

    }




    try{


      setIsLoading(true);



      let response;



      if(mode==='login'){


        response=await AuthAPI.login({

          username:formData.username,

          password:formData.password

        });


        toast.success(
          'Успешный вход'
        );


      }
      else{


        response=await AuthAPI.register({

          email:formData.email,

          username:formData.username,

          password:formData.password,

          captchaToken

        });


        toast.success(
          'Аккаунт создан'
        );


      }



      login(response.accessToken);


      window.location.href=
        CONFIG.ROUTES.CHAT;



    }
    catch(err:any){


      toast.error(
        err.message ||
        'Ошибка авторизации'
      );


      setCaptchaToken('');

    }
    finally{


      setIsLoading(false);


    }


  };





return (

<main className="auth-page">


<section className="auth-card">


<header className="auth-header">


<h1>

{
mode==='login'
?
'С возвращением!'
:
'Создать учётную запись'

}

</h1>


<p>

{
mode==='login'
?
'Мы так рады видеть вас снова!'
:
'Зарегистрируйтесь и начните общаться'

}

</p>


</header>





<form onSubmit={handleSubmit}>


<fieldset disabled={isLoading}>


{
mode==='register' &&

<>


<div className="auth-field">

<label>Email</label>

<input

type="email"

name="email"

value={formData.email}

onChange={handleChange}

autoComplete="email"

required

/>

</div>





<div className="auth-field">

<label>Отображаемое имя</label>


<input

name="displayName"

value={formData.displayName}

onChange={handleChange}

/>


</div>


</>

}




<div className="auth-field">


<label>

{
mode==='login'
?
'Email или имя пользователя'
:
'Имя пользователя'

}

</label>



<input


name="username"

value={formData.username}

onChange={handleChange}

autoComplete="username"

required


/>


</div>





<div className="auth-field">


<label>

Пароль

</label>


<input


type="password"

name="password"

value={formData.password}

onChange={handleChange}

autoComplete={
mode==='login'
?
"current-password"
:
"new-password"
}

required


/>



{
mode==='login' &&

<div className="forgot">

<a className="auth-link">

Забыли пароль?

</a>

</div>

}



</div>





{
mode==='register' &&


<div className="auth-field">


<label>

Дата рождения

</label>



<div className="birthday-row">



<select

name="birthDay"

className="auth-select"

onChange={handleChange}

>

<option>
День
</option>


{
Array.from(
{length:31},
(_,i)=>
<option key={i}>
{i+1}
</option>
)

}


</select>





<select

name="birthMonth"

className="auth-select"

onChange={handleChange}

>


<option>
Месяц
</option>

{
[
'Январь',
'Февраль',
'Март',
'Апрель',
'Май',
'Июнь',
'Июль',
'Август',
'Сентябрь',
'Октябрь',
'Ноябрь',
'Декабрь'
].map((m,i)=>

<option key={i}>

{m}

</option>

)

}


</select>





<select

name="birthYear"

className="auth-select"

onChange={handleChange}

>


<option>
Год
</option>


{
Array.from(
{length:100},
(_,i)=>

<option key={i}>

{2026-i}

</option>

)

}


</select>



</div>


</div>


}






{
mode==='register' &&


<div className="captcha">


<Turnstile
    siteKey={CONFIG.CAPTCHA_SITE_KEY}
    onSuccess={(token) => setCaptchaToken(token)}
    options={{
        theme: 'dark'
    }}
/>


</div>


}





<button

className="auth-button"

type="submit"

>


{
isLoading
?
'Загрузка...'
:
mode==='login'
?
'Войти'
:
'Создать аккаунт'

}


</button>





<footer className="auth-footer">


{
mode==='login'
?

<>

Нет аккаунта?

{' '}

<span

className="auth-link"

onClick={()=>handleModeSwitch('register')}

>

Зарегистрироваться

</span>


</>


:

<>

Уже есть аккаунт?

{' '}


<span

className="auth-link"

onClick={()=>handleModeSwitch('login')}

>

Войти

</span>


</>


}


</footer>




</fieldset>


</form>


</section>


</main>


);


};