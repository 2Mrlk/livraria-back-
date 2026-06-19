<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login Aluno</title>

<style>
body{
    font-family: Arial, sans-serif;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
    background:#f5f5f5;
}

.card{
    background:white;
    padding:30px;
    border-radius:12px;
    box-shadow:0 0 10px rgba(0,0,0,.1);
    width:300px;
}

input,button{
    width:100%;
    padding:10px;
    margin-top:10px;
}

button{
    cursor:pointer;
}
</style>
</head>
<body>

<div class="card">
    <h2>Login do Aluno</h2>

    <input
        id="rm"
        placeholder="Digite seu RM"
    >

    <button onclick="login()">
        Entrar
    </button>

    <p id="msg"></p>
</div>

<script>
async function login(){

    const rm = document.getElementById('rm').value;

    const resposta = await fetch(
        'https://SEU-BACKEND.vercel.app/api/students/auth/login',
        {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({ rm })
        }
    );

    const dados = await resposta.json();

    if(resposta.ok){

        localStorage.setItem(
            'token',
            dados.token
        );

        document.getElementById('msg').innerText =
            `Bem-vindo ${dados.aluno.nome}`;
    }
    else{
        document.getElementById('msg').innerText =
            dados.error;
    }
}
</script>

</body>
</html>
