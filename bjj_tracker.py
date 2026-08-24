import sqlite3
from datetime import datetime, timedelta
import calendar

DB_NAME = 'bjj_tracker.db'

def inicializar_banco():
    """Cria as tabelas e insere posições padrão se o catálogo estiver vazio."""
    conexao = sqlite3.connect(DB_NAME)
    cursor = conexao.cursor()

    # 1. Tabela de Treinos (Com flag no caso de competição)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS treinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data TEXT NOT NULL,
        tipo_treino TEXT NOT NULL,
        local TEXT NOT NULL,
        instrutor TEXT,
        duracao_minutos INTEGER,
        quantidade_rolas INTEGER,
        intensidade INTEGER CHECK(intensidade BETWEEN 1 AND 5),
        houve_lesao BOOLEAN,
        gravidade_lesao TEXT,
        is_competicao BOOLEAN,
        observacoes TEXT
    )
    """)

    # 2. Tabela Catálogo de Posições (A lista pré-pronta de posições, mas pode ser incrementada)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS posicoes_catalogo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL
    )
    """)

    # 3. Tabela de Registro de Rolas (os combates realizados)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS registro_rolas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_treino INTEGER NOT NULL,
        tipo_evento TEXT NOT NULL, -- Ex: 'Aplicada', 'Sofrida'
        nome_posicao TEXT NOT NULL,
        quantidade INTEGER DEFAULT 1,
        FOREIGN KEY (id_treino) REFERENCES treinos(id)
    )
    """)

    # Inserir posições padrão se o catálogo estiver vazio
    cursor.execute("SELECT COUNT(*) FROM posicoes_catalogo")
    if cursor.fetchone()[0] == 0:
        posicoes_iniciais = [
            'Katagatame',
            'Darce Choke',
            'Armlock',
            'Triângulo',
            'Omoplata',
            'Kimura',
            'Guilhotina',
            'Raspagem',
            'Passagem de Guarda'
        ]
        for pos in posicoes_iniciais:
            cursor.execute("INSERT INTO posicoes_catalogo (nome) VALUES (?)", (pos,))

        conexao.commit()
        conexao.close()

def obter_ou_criar_posicao(conexao):
    """Exibe o catálogo, permite escolher ou criar uma nova posição."""
    cursor = conexao.cursor()
    cursor.execute("SELECT id, nome FROM posicoes_catalogo ORDER BY nome")
    catalogo = cursor.fetchall()

    print("\n--- Catálogo de Posições ---")
    opcoes_menu = {}
    indice = 1 # contador



    for id_pos, nome in catalogo:
        print(f"[{indice}] {nome}")
        opcoes_menu[str(indice)] = nome
        indice += 1
    print("[0] Adicionar NOVA posição")

    escolha = input("Escolha o número da posição (ou 0 para nova): ").strip()

    if escolha == "0":
        nova_posicao = input("Digite o nome da nova posição: ").strip().title()
        try:
            cursor.execute("INSERT INTO posicoes_catalogo (nome) VALUES (?)", (nova_posicao,))
            conexao.commit()
            return nova_posicao
        except sqlite3.IntegrityError:
            # Caso o usuário digite algo que já existe
            return nova_posicao

    else:
        #Busca o nome correspondente ao ID digitado
        if escolha in opcoes_menu:
            return opcoes_menu[escolha]
        else:
            print("Opção inválida. Usando 'Posição Desconhecida'.")
            return "Posição Desconhecida"

def cadastrar_treino():
    """Função principal para registrar um dia de treino e seus rolas."""
    print("\n--- Cadastro de Treino ---")

    data_padrao = datetime.now().strftime("%Y-%m-%d")
    data = input(f"Data (AAAA-MM-DD) [Padrão: {data_padrao}]: ").strip() or data_padrao

    is_competicao_input = input("Este evento foi uma competição? (s/n): ").strip().lower()
    is_competicao = True if is_competicao_input == 's' else False

    tipo_treino = input("Tipo (Ex: Livre, Open Mat, Drills) ou Nome do Campeonato: ").strip()
    local = input("Local: ").strip()
    instrutor = input("Professor/Instrutor: ").strip()

    # Coleta de dados numéricos com tratamento de erro básico
    duracao = int(input("Duração (em minutos): ").strip() or 0)
    qtd_rolas = int(input("Quantidade de rolas: ").strip() or 0)
    intensidade = int(input("Intensidade (1 a 5): ").strip() or 3)

    lesao_input = input("Houve lesão? (s/n): ").strip().lower()
    houve_lesao = True if lesao_input == 's' else False
    gravidade_lesao = ""
    if houve_lesao:
        gravidade_lesao = input("Gravidade da Lesão (Ex: Leve, Moderada, Grave): ").strip()

    observacoes = input("Observações/Resumo do dia: ").strip()

    # Gravando o Treino no banco

    conexao = sqlite3.connect(DB_NAME)
    cursor = conexao.cursor()

    cursor.execute("""
        INSERT INTO treinos (data, tipo_treino, local, instrutor, duracao_minutos, quantidade_rolas, intensidade, houve_lesao, gravidade_lesao, is_competicao, observacoes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (data, tipo_treino, local, instrutor, duracao, qtd_rolas, intensidade, houve_lesao, gravidade_lesao, is_competicao, observacoes))

    id_treino = cursor.lastrowid # Pega o ID do treino que acabamos de criar

    # Registro de Posições/Eventos nos Rolas
    print("\n --- Registro de Posições nos Rolas ---")
    while True:
        adicionar = input("Deseja registrar uma posição/finalização desse treino? (s/n): ").strip().lower()
        if adicionar != 's':
            break

        tipo_evento = input("Foi (1) Aplicada ou (2) Sofrida contra? (1/2): ").strip()
        evento_str = "Aplicada" if tipo_evento == '1' else "Sofrida"

        nome_pos = obter_ou_criar_posicao(conexao)
        qtd_pos = int(input(f"Quantas vezes essa posição ocorreu ({nome_pos})? ").strip() or 1)

        cursor.execute("""
            INSERT INTO registro_rolas(id_treino, tipo_evento, nome_posicao, quantidade)
            VALUES (?, ?, ?, ?)
        """, (id_treino, evento_str, nome_pos, qtd_pos))
        print(f"-> Registrado: {qtd_pos}x {nome_pos} ({evento_str}).")

    conexao.commit()
    conexao.close()
    print("\n[Sucesso] Treino e rolas salvos com sucesso!")

def listar_treinos():
    """Exibe o histórico de treinos e os detalhes dos rolas."""
    conexao = sqlite3.connect(DB_NAME)
    cursor = conexao.cursor()

    cursor.execute("SELECT id, data, tipo_treino, is_competicao, intensidade FROM treinos ORDER BY data DESC")
    treinos = cursor.fetchall()

    if not treinos:
        print("\n Nenhum treino cadastrado.")
        conexao.close()
        return

    print("\n--- Histórico de Treinos ---")
    for t in treinos:
        id_t, data, tipo, is_comp, intensidade = t
        comp_tag = "[COMPETIÇÃO]" if is_comp else "[TREINO]"
        print(f"\nID: {id_t} | Data: {data} | Tipo: {tipo} {comp_tag} | Intensidade: {intensidade}/5")

        # Busca as posições vinculadas a este treino
        cursor.execute("SELECT tipo_evento, nome_posicao, quantidade FROM registro_rolas WHERE id_treino = ?", (id_t,))
        posicoes = cursor.fetchall()

        if posicoes:
            for p in posicoes:
                print(f" - {p[2]}x {p[1]} ({p[0]})")
    
    conexao.close()

def gerar_estatisticas():
    """Gera um relatório de desempenho filtrado por período de tempo."""
    print("\n" + "="*30)
    print("RELATÓRIO DE DESEMPENHO")
    print("="*30)
    
    # 1. Submenu de escolha de período
    print("Escolha o período de análise:")
    print("[1] Últimos 7 dias")
    print("[2] Últimos 30 dias")
    print("[3] Todos os tempos")
    
    escolha = input("Opção: ").strip()
    
    hoje = datetime.now()
    
    # 2. Definindo a data de corte baseada na escolha
    if escolha == "1":
        # Subtrai 7 dias da data de hoje e formata como texto AAAA-MM-DD
        data_corte = (hoje - timedelta(days=7)).strftime("%Y-%m-%d")
        print(f"\n--- Filtrando a partir de: {data_corte} ---")
    elif escolha == "2":
        # Subtrai 30 dias
        data_corte = (hoje - timedelta(days=30)).strftime("%Y-%m-%d")
        print(f"\n--- Filtrando a partir de: {data_corte} ---")
    else:
        # Colocamos uma data muito antiga para incluir todos os registros
        data_corte = "1900-01-01"
        print("\n--- Filtrando: Todos os tempos ---")

    conexao = sqlite3.connect(DB_NAME)
    cursor = conexao.cursor()
    
    # 3. Calculando Treinos e Tempo usando a data de corte (WHERE data >= ?)
    cursor.execute("SELECT COUNT(id), SUM(duracao_minutos) FROM treinos WHERE data >= ?", (data_corte,))
    resultado_geral = cursor.fetchone()
    total_treinos = resultado_geral[0] or 0
    tempo_total = resultado_geral[1] or 0
    
    print(f"Total de Treinos no período: {total_treinos}")
    print(f"Tempo de Tatame no período: {tempo_total} minutos")
    
    if total_treinos == 0:
        print("Nenhum dado encontrado para este período.")
        conexao.close()
        return

    # 4. Top 3 Posições Aplicadas usando JOIN
    # Unimos (JOIN) registro_rolas com treinos para poder filtrar pela data do treino
    cursor.execute("""
        SELECT r.nome_posicao, SUM(r.quantidade) as total 
        FROM registro_rolas r
        JOIN treinos t ON r.id_treino = t.id
        WHERE r.tipo_evento = 'Aplicada' AND t.data >= ?
        GROUP BY r.nome_posicao 
        ORDER BY total DESC 
        LIMIT 3
    """, (data_corte,))
    melhores_posicoes = cursor.fetchall()
    
    print("\nTOP 3 - Posições Aplicadas no Período:")
    if melhores_posicoes:
        for pos in melhores_posicoes:
            print(f"  -> {pos[0]}: {pos[1]} vezes")
    else:
        print("  -> Nenhum registro neste período.")

    # 5. Top 3 Posições Sofridas usando JOIN
    cursor.execute("""
        SELECT r.nome_posicao, SUM(r.quantidade) as total 
        FROM registro_rolas r
        JOIN treinos t ON r.id_treino = t.id
        WHERE r.tipo_evento = 'Sofrida' AND t.data >= ?
        GROUP BY r.nome_posicao 
        ORDER BY total DESC 
        LIMIT 3
    """, (data_corte,))
    piores_posicoes = cursor.fetchall()
    
    print("\nTOP 3 - Posições Sofridas no Período (Atenção na Defesa):")
    if piores_posicoes:
        for pos in piores_posicoes:
            print(f"  -> {pos[0]}: {pos[1]} vezes")
    else:
        print("  -> Nenhum registro neste período.")

    conexao.close()

def gerenciar_perfil():
    """Permite visualizar e atualizar a faixa e os graus do usuário."""
    conexao = sqlite3.connect(DB_NAME)
    cursor = conexao.cursor()
    
    print("\n" + "="*30)
    print("MEU PERFIL E PROGRESSÃO")
    print("="*30)
    
    # 1. Verifica se já existe um perfil cadastrado (ID 1)
    cursor.execute("SELECT faixa, graus, data_inicio_treino FROM perfil WHERE id = 1")
    perfil_atual = cursor.fetchone()
    
    if perfil_atual:
        # Se encontrou o perfil, exibe os dados atuais
        faixa, graus, data_inicio = perfil_atual
        print(f"Status Atual: Faixa {faixa} com {graus} grau(s).")
        print(f"Início dos treinos: {data_inicio}")
        
        atualizar = input("\nDeseja atualizar sua graduação? (s/n): ").strip().lower()
        if atualizar != 's':
            conexao.close()
            return
    else:
        # Se não encontrou, será o primeiro cadastro
        print("Nenhum perfil cadastrado ainda. Vamos criar o seu!")
        
    # 2. Coleta dos novos dados
    faixas_validas = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]
    print(f"Faixas válidas: {', '.join(faixas_validas)}")
    
    nova_faixa = input("Sua faixa atual: ").strip().title()
    while nova_faixa not in faixas_validas:
        print("Erro: Digite uma faixa válida (Ex: Branca, Azul...).")
        nova_faixa = input("Sua faixa atual: ").strip().title()
        
    try:
        novos_graus = int(input("Quantidade de graus (0 a 4): ").strip())
    except ValueError:
        novos_graus = 0
        print("Valor inválido. Assumindo 0 graus.")
        
    # 3. Salvando no banco de dados
    if perfil_atual:
        # UPDATE: Modifica os dados da linha que já existe (ID 1)
        cursor.execute("""
            UPDATE perfil 
            SET faixa = ?, graus = ? 
            WHERE id = 1
        """, (nova_faixa, novos_graus))
        print("\n[Sucesso] Parabéns pela nova graduação! Perfil atualizado.")
    else:
        # INSERT: Cria a primeira linha no banco
        data_inicio = input("Data em que começou a treinar Jiu-Jitsu (AAAA-MM-DD): ").strip()
        cursor.execute("""
            INSERT INTO perfil (id, faixa, graus, data_inicio_treino) 
            VALUES (1, ?, ?, ?)
        """, (nova_faixa, novos_graus, data_inicio))
        print("\n[Sucesso] Perfil criado com sucesso! Oss!")

    conexao.commit()
    conexao.close()

def visualizar_calendario_e_graficos():
    """Gera um calendário e gráficos em formato de texto nativo do terminal."""
    conexao = sqlite3.connect(DB_NAME)
    cursor = conexao.cursor()
    
    hoje = datetime.now()
    ano = hoje.year
    mes = hoje.month
    
    print("\n" + "="*30)
    print(f"📅 CALENDÁRIO DE TREINOS - {mes:02d}/{ano} 📅")
    print("="*30)
    
    # 1. Buscando apenas os dias que você treinou no mês atual
    # O comando LIKE busca datas que comecem com "AAAA-MM"
    cursor.execute("SELECT data FROM treinos WHERE data LIKE ?", (f"{ano}-{mes:02d}-%",))
    treinos_do_mes = cursor.fetchall()
    
    # Extraindo apenas o número do dia (ex: de "2026-08-21" tira o "21")
    dias_treinados = []
    for t in treinos_do_mes:
        dia_string = t[0].split("-")[2] # Divide a data pelos tracinhos e pega a terceira parte
        dias_treinados.append(int(dia_string))
        
    # 2. Desenhando o calendário no terminal
    cal = calendar.monthcalendar(ano, mes)
    print("Seg Ter Qua Qui Sex Sab Dom")
    
    for semana in cal:
        linha = ""
        for dia in semana:
            if dia == 0:
                linha += "    " # Espaço vazio para dias fora do mês
            elif dia in dias_treinados:
                linha += "[X] " # Marca os dias treinados
            else:
                linha += f"{dia:02d}  " # Imprime o dia normal com dois dígitos
        print(linha)
        
    # 3. Gráfico de Barras (Intensidade dos últimos 5 treinos)
    print("\n" + "="*30)
    print("📈 GRÁFICO DE INTENSIDADE (Últimos 5 treinos)")
    print("="*30)
    
    cursor.execute("SELECT data, tipo_treino, intensidade FROM treinos ORDER BY data DESC LIMIT 5")
    ultimos_treinos = cursor.fetchall()
    
    if not ultimos_treinos:
        print("Nenhum treino registrado para gerar o gráfico.")
    else:
        # Invertemos a lista com reversed() para o gráfico mostrar do mais antigo para o mais novo
        for t in reversed(ultimos_treinos):
            data, tipo, intensidade = t
            # Multiplicamos o caractere pela intensidade para criar a barra
            barra = "█" * intensidade 
            
            # Formatação: reserva 12 espaços para o tipo do treino ficar alinhado
            tipo_formatado = (tipo[:10] + '..') if len(tipo) > 12 else tipo.ljust(12)
            
            print(f"{data} | {tipo_formatado} | {barra} ({intensidade}/5)")

    conexao.close()

def main():
    inicializar_banco()
    while True:
        print("\n" + "="*30)
        print("BJJ TRACKER PESSOAL")
        print("="*30)
        print("1. Cadastrar novo treino")
        print("2. Listar histórico de treinos")
        print("3. Ver estatísticas e relatórios")
        print("4. Meu perfil e progressão")
        print("5. Visualizar calendário e gráficos")
        print("6. Sair")

        opcao = input("Escolha uma opção: ").strip()
        if opcao == "1":
            cadastrar_treino()
        elif opcao == "2":
            listar_treinos()
        elif opcao == "3":
            gerar_estatisticas()
        elif opcao == "4":
            gerenciar_perfil()
        elif opcao == "5":
            visualizar_calendario_e_graficos()
        elif opcao == "6":
            print("Oss! Bom treino.")
            break
        else:
            print("Opção inválida. Tente novamente.")

if __name__ == "__main__":
    main()