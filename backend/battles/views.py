from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import BattleRoom
import json
import random

# ── 100+ Offline Fallback Quiz Question Bank (Used when AI is unavailable) ─────────────

FALLBACK_QUIZ_EASY = [
    {"q": "What does HTML stand for?", "opts": ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Logic", "Hyperlink Text Markup Language"], "ans": 0},
    {"q": "Which symbol is used for single-line comments in Python?", "opts": ["//", "/*", "#", "--"], "ans": 2},
    {"q": "What is the output of: print(type(42)) in Python?", "opts": ["<class 'float'>", "<class 'int'>", "<class 'str'>", "<class 'number'>"], "ans": 1},
    {"q": "Which HTTP method is used to retrieve data from a server?", "opts": ["POST", "PUT", "DELETE", "GET"], "ans": 3},
    {"q": "What does CSS stand for?", "opts": ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], "ans": 1},
    {"q": "Which data structure works on LIFO (Last In First Out) principle?", "opts": ["Queue", "Stack", "Array", "Linked List"], "ans": 1},
    {"q": "What does SQL stand for?", "opts": ["Structured Query Language", "Simple Query Logic", "Sequential Question Language", "Standard Query List"], "ans": 0},
    {"q": "Which of the following is NOT a primitive JavaScript data type?", "opts": ["String", "Boolean", "Float", "Undefined"], "ans": 2},
    {"q": "What does 'git push' do?", "opts": ["Downloads remote changes", "Uploads local commits to remote repository", "Creates a new branch", "Merges branches"], "ans": 1},
    {"q": "In Python, which keyword is used to define a function?", "opts": ["function", "def", "fun", "define"], "ans": 1},
    {"q": "What is a REST API?", "opts": ["A database engine", "An HTTP-based architectural style for web services", "A Python library", "A CSS framework"], "ans": 1},
    {"q": "Which HTML tag is used for the main largest heading?", "opts": ["<h6>", "<heading>", "<h1>", "<head>"], "ans": 2},
    {"q": "What is a variable in programming?", "opts": ["A fixed constant value", "A named memory location that holds data", "A type of loop", "A function definition"], "ans": 1},
    {"q": "What does JSON stand for?", "opts": ["Java Syntax Object Notation", "JavaScript Object Notation", "Java Sequential Object Nodes", "Just Simple Object Names"], "ans": 1},
    {"q": "Which of these represents a Python list syntax?", "opts": ["{1, 2, 3}", "(1, 2, 3)", "[1, 2, 3]", "<1, 2, 3>"], "ans": 2},
    {"q": "Which symbol is used for single-line comments in JavaScript?", "opts": ["//", "#", "<!--", "/*"], "ans": 0},
    {"q": "What is the time complexity of looking up an item in a Hash Table on average?", "opts": ["O(n)", "O(log n)", "O(1)", "O(n^2)"], "ans": 2},
    {"q": "Which keyword is used to declare a constant variable in JavaScript?", "opts": ["var", "let", "const", "static"], "ans": 2},
    {"q": "What does 'git status' command show?", "opts": ["Commit log", "State of working directory and staging area", "Remote URLs", "List of branches"], "ans": 1},
    {"q": "Which of the following is a frontend JavaScript framework/library?", "opts": ["Django", "Express", "React", "Flask"], "ans": 2},
    {"q": "What is the result of 3 + '3' in JavaScript?", "opts": ["6", "'33'", "NaN", "TypeError"], "ans": 1},
    {"q": "Which data structure works on FIFO (First In First Out) principle?", "opts": ["Stack", "Queue", "Binary Tree", "Heap"], "ans": 1},
    {"q": "Which CSS property changes the text color of an element?", "opts": ["font-color", "text-style", "color", "background-color"], "ans": 2},
    {"q": "Which operator is used for exponentiation in Python?", "opts": ["^", "**", "//", "exp()"], "ans": 1},
    {"q": "What is the default port number for HTTP web traffic?", "opts": ["443", "80", "8080", "22"], "ans": 1},
    {"q": "What is the default port number for HTTPS secure traffic?", "opts": ["80", "443", "3000", "21"], "ans": 1},
    {"q": "Which Python keyword handles exceptions?", "opts": ["try / except", "do / catch", "try / catch", "error / handle"], "ans": 0},
    {"q": "Which SQL clause is used to filter query results?", "opts": ["GROUP BY", "WHERE", "ORDER BY", "SELECT"], "ans": 1},
    {"q": "What is the index of the first element in a standard zero-indexed array?", "opts": ["1", "0", "-1", "None"], "ans": 1},
    {"q": "Which Git command creates a new local branch?", "opts": ["git branch <name>", "git add <name>", "git status <name>", "git push <name>"], "ans": 0},
    {"q": "What does DOM stand for in web development?", "opts": ["Document Object Model", "Data Object Manager", "Digital Output Module", "Desktop Object Mode"], "ans": 0},
    {"q": "Which of the following is a Python tuple?", "opts": ["(1, 2, 3)", "[1, 2, 3]", "{1, 2, 3}", "<1, 2, 3>"], "ans": 0},
    {"q": "What does URL stand for?", "opts": ["Universal Resource Link", "Uniform Resource Locator", "Unified Retrieval Location", "Universal Routing Logic"], "ans": 1},
    {"q": "In Python, how do you get the length of a list named `my_list`?", "opts": ["my_list.length()", "len(my_list)", "length(my_list)", "my_list.size()"], "ans": 1},
    {"q": "Which CSS property is used to control spacing outside an element's border?", "opts": ["padding", "margin", "border-spacing", "gap"], "ans": 1},
    {"q": "Which CSS property controls spacing inside an element's border?", "opts": ["margin", "padding", "content-space", "gap"], "ans": 1},
    {"q": "What does a 404 HTTP status code mean?", "opts": ["Success", "Forbidden", "Not Found", "Internal Server Error"], "ans": 2},
    {"q": "What does a 200 HTTP status code mean?", "opts": ["OK / Success", "Created", "No Content", "Redirect"], "ans": 0},
    {"q": "Which command initializes a new Git repository?", "opts": ["git create", "git init", "git start", "git new"], "ans": 1},
    {"q": "Which loop guarantees at least one execution in languages like C/Java/JS?", "opts": ["for loop", "while loop", "do-while loop", "foreach loop"], "ans": 2},
]

FALLBACK_QUIZ_MEDIUM = [
    {"q": "What is the time complexity of Binary Search?", "opts": ["O(n)", "O(n²)", "O(log n)", "O(1)"], "ans": 2},
    {"q": "Which HTTP status code signifies 'Unauthorized' access?", "opts": ["400", "403", "401", "404"], "ans": 2},
    {"q": "What is a Foreign Key in a relational database?", "opts": ["A primary key from another table", "An encrypted key", "A secondary index", "A unique key in the same table"], "ans": 0},
    {"q": "What does `async/await` do in JavaScript?", "opts": ["Executes code synchronously", "Handles asynchronous operations cleanly", "Renders CSS animations", "Manipulates DOM directly"], "ans": 1},
    {"q": "Which sorting algorithm repeatedly finds the minimum element and places it at the beginning?", "opts": ["Bubble Sort", "Merge Sort", "Selection Sort", "Quick Sort"], "ans": 2},
    {"q": "What is the worst-case time complexity of QuickSort?", "opts": ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], "ans": 1},
    {"q": "What is the average time complexity of Merge Sort?", "opts": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], "ans": 1},
    {"q": "What does `docker-compose up` command do?", "opts": ["Builds a single image", "Starts containers defined in docker-compose.yml", "Pushes code to Docker Hub", "Prunes unused volumes"], "ans": 1},
    {"q": "What is the primary purpose of an index in a database?", "opts": ["Enforce constraints", "Speed up data retrieval", "Encrypt confidential columns", "Manage foreign keys"], "ans": 1},
    {"q": "What is the difference between `==` and `===` in JavaScript?", "opts": ["No difference", "=== checks both value and type without coercion", "== checks type only", "=== is used for assignment"], "ans": 1},
    {"q": "What is a closure in JavaScript?", "opts": ["A function bundled with references to its surrounding lexical state", "A loop that terminates early", "A syntax error handler", "A built-in method"], "ans": 0},
    {"q": "What is a Python decorator?", "opts": ["A class method", "A function that takes another function and extends its behavior", "A CSS styling rule", "A data structure"], "ans": 1},
    {"q": "What does JWT stand for in web security?", "opts": ["Java Web Token", "JSON Web Token", "JavaScript Web Transfer", "JSON Website Tag"], "ans": 1},
    {"q": "Which SQL statement is used to delete existing records in a table?", "opts": ["DROP", "REMOVE", "DELETE", "TRUNCATE"], "ans": 2},
    {"q": "What does Big O notation measure?", "opts": ["Code lines count", "Algorithm time/space scalability with input size", "API response payload", "Git history size"], "ans": 1},
    {"q": "What is the primary role of a Load Balancer?", "opts": ["Store session state", "Distribute incoming network traffic across multiple servers", "Encrypt database records", "Compile server code"], "ans": 1},
    {"q": "What is React's Virtual DOM?", "opts": ["A server-side rendering tool", "An in-memory lightweight representation of the real DOM", "A CSS preprocessor", "A global state library"], "ans": 1},
    {"q": "Which HTTP status code means 'Created'?", "opts": ["200", "204", "201", "202"], "ans": 2},
    {"q": "What does CORS stand for in web security?", "opts": ["Cross-Origin Resource Sharing", "Central Object Routing System", "Computer Online Rest Service", "Core Object Resource Set"], "ans": 0},
    {"q": "What is the purpose of `useCallback` in React?", "opts": ["Fetch data asynchronously", "Memoize function instances between renders", "Manage global state", "Handle routing"], "ans": 1},
    {"q": "What is the time complexity of Inserting an element into a Min-Heap?", "opts": ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "ans": 1},
    {"q": "Which design pattern is useful for notifying multiple objects about state changes?", "opts": ["Observer Pattern", "Singleton Pattern", "Factory Pattern", "Strategy Pattern"], "ans": 0},
    {"q": "What is the purpose of a Dockerfile?", "opts": ["Run docker containers", "Blueprint script to build a Docker image", "Store environment secrets", "Manage swarm nodes"], "ans": 1},
    {"q": "What is a Primary Key in SQL?", "opts": ["A field that uniquely identifies each row in a table", "A key used for table joins", "An optional index", "A foreign relationship"], "ans": 0},
    {"q": "What is a Promise in JavaScript?", "opts": ["A synchronous function", "An object representing the eventual completion/failure of an async task", "A loop structure", "A type definition"], "ans": 1},
    {"q": "Which array method in JS creates a new array by applying a function to every element?", "opts": ["forEach()", "filter()", "map()", "reduce()"], "ans": 2},
    {"q": "Which array method in JS filters elements based on a test function?", "opts": ["map()", "filter()", "find()", "slice()"], "ans": 1},
    {"q": "What is middleware in Express/Django framework?", "opts": ["Database engine", "Functions executing during request-response cycle before reaching handler", "UI theme template", "Front-end routing"], "ans": 1},
    {"q": "What does SQL `GROUP BY` clause do?", "opts": ["Sorts output rows", "Groups rows that have the same values into summary rows", "Joins two tables", "Filters initial rows"], "ans": 1},
    {"q": "What is the time complexity of Breadth-First Search (BFS) on a graph (V vertices, E edges)?", "opts": ["O(V)", "O(E)", "O(V + E)", "O(V * E)"], "ans": 2},
    {"q": "What is the time complexity of Depth-First Search (DFS) on a graph?", "opts": ["O(V * E)", "O(V + E)", "O(V^2)", "O(log V)"], "ans": 1},
    {"q": "What is a Deadlock in operating systems?", "opts": ["A crashed process", "Two or more processes waiting indefinitely for resources held by each other", "A memory leak", "A CPU overload"], "ans": 1},
    {"q": "What is the purpose of `git stash`?", "opts": ["Delete uncommitted work", "Temporarily shelves modified tracked changes so you can switch context", "Create a new release", "Push to remote"], "ans": 1},
    {"q": "What does CSS Flexbox `justify-content` property do?", "opts": ["Aligns flex items along cross axis", "Aligns flex items along main axis", "Sets item width", "Controls font size"], "ans": 1},
    {"q": "What does CSS Flexbox `align-items` property do?", "opts": ["Aligns items along main axis", "Aligns flex items along cross axis", "Sets element padding", "Rotates items"], "ans": 1},
    {"q": "What is a Linked List advantage over a standard Array?", "opts": ["O(1) random index access", "Efficient O(1) insertions/deletions at head without shifting elements", "Less memory usage per element", "Better cache locality"], "ans": 1},
    {"q": "What is the space complexity of an adjacency matrix for a graph with V vertices?", "opts": ["O(V)", "O(V + E)", "O(V²)", "O(E)"], "ans": 2},
    {"q": "What does HTTP status code 500 indicate?", "opts": ["Bad Request", "Internal Server Error", "Gateway Timeout", "Service Unavailable"], "ans": 1},
    {"q": "Which Python built-in function returns an iterator of tuples pairing elements from inputs?", "opts": ["enumerate()", "map()", "zip()", "combine()"], "ans": 2},
    {"q": "Which Python function returns both index and item while iterating over a sequence?", "opts": ["zip()", "enumerate()", "range()", "items()"], "ans": 1},
]

FALLBACK_QUIZ_HARD = [
    {"q": "Which design pattern restricts class instantiation to a single object instance?", "opts": ["Factory", "Observer", "Singleton", "Decorator"], "ans": 2},
    {"q": "What does the CAP Theorem state about distributed data stores?", "opts": ["System cannot simultaneously guarantee Consistency, Availability, and Partition Tolerance", "Systems can easily guarantee all 3 simultaneously", "Consistency is only required for SQL databases", "Partition tolerance is optional"], "ans": 0},
    {"q": "What is the time complexity of HeapSort?", "opts": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], "ans": 1},
    {"q": "What is Eventual Consistency in distributed databases?", "opts": ["All nodes update synchronously", "Given time without new updates, all replicas will converge to the same data", "Data is immediately consistent everywhere", "Only master node can read"], "ans": 1},
    {"q": "What do ACID properties in database transactions ensure?", "opts": ["Query speed optimization", "Reliable processing and data integrity", "Index generation", "Network compression"], "ans": 1},
    {"q": "In Kubernetes, what is a Pod?", "opts": ["A container image storage unit", "The smallest deployable computing unit containing one or more containers", "A worker node machine", "A network load balancer"], "ans": 2},
    {"q": "What is the difference between Horizontal and Vertical scaling?", "opts": ["Vertical adds more server instances; Horizontal adds hardware resources to existing server", "Horizontal adds more server instances; Vertical adds hardware resources to existing server", "They are identical strategies", "Horizontal scaling only works for SQL"], "ans": 1},
    {"q": "What is a Race Condition in multithreaded programming?", "opts": ["A speed test benchmark", "Unintended behavior occurring when multiple threads access shared data concurrently without synchronization", "A deadlock situation", "A memory leak"], "ans": 1},
    {"q": "What is Redis primarily used for in modern web architectures?", "opts": ["Primary relational storage", "High-performance in-memory caching and key-value datastore", "Static file serving", "Code compilation"], "ans": 1},
    {"q": "What is the N+1 query problem in ORMs?", "opts": ["Executing N+1 separate SQL queries for N items due to lazy loading relations", "Using N+1 databases in parallel", "Having N+1 foreign keys", "Exceeding transaction pool by 1"], "ans": 0},
    {"q": "What is a Binary Heap data structure primarily used to implement?", "opts": ["Hash maps", "Priority Queues", "Linked lists", "Graph nodes"], "ans": 1},
    {"q": "What does the Liskov Substitution Principle (L in SOLID) state?", "opts": ["Classes should be open for extension", "Objects of a superclass should be replaceable with objects of a subclass without breaking application logic", "Depend on abstractions, not concretions", "Single responsibility per module"], "ans": 1},
    {"q": "What is Database Sharding?", "opts": ["Data encryption at rest", "Horizontal partitioning of data across distinct database instances", "Index rebuilding", "Automated daily backups"], "ans": 1},
    {"q": "What is the Circuit Breaker pattern used for in Microservices?", "opts": ["API authentication", "Preventing cascading system failures by isolating failing microservices", "Load balancing requests", "Data compression"], "ans": 1},
    {"q": "What is the amortized time complexity of dynamic array push (e.g. C++ vector or JS array)?", "opts": ["O(n)", "O(1)", "O(log n)", "O(n²)"], "ans": 1},
    {"q": "What is a Trie data structure best optimized for?", "opts": ["Sorting numbers", "Fast prefix matching and autocomplete search", "Matrix multiplication", "Graph shortest paths"], "ans": 1},
    {"q": "What algorithm does Dijkstra's shortest path algorithm rely on to pick the next node efficiently?", "opts": ["Stack", "Priority Queue / Min-Heap", "Hash Map", "Binary Search Tree"], "ans": 1},
    {"q": "What is the time complexity of Bellman-Ford shortest path algorithm for V vertices and E edges?", "opts": ["O(V + E)", "O(V * E)", "O(V²)", "O(E log V)"], "ans": 1},
    {"q": "What is the main difference between B-Trees and B+ Trees in database indexing?", "opts": ["B+ Trees store data pointers only in leaf nodes, making leaf traversal fast", "B-Trees have no root node", "B+ Trees cannot handle range queries", "B-Trees store no keys"], "ans": 0},
    {"q": "What is a Bloom Filter?", "opts": ["A space-efficient probabilistic data structure that tests if an element is definitely NOT in a set or MIGHT be in a set", "An image filtering library", "A tree traversal algorithm", "A cryptography cipher"], "ans": 0},
    {"q": "What does the Single Responsibility Principle (S in SOLID) advocate?", "opts": ["A class should have one, and only one, reason to change", "A class should inherit from one parent", "A service should run on a single thread", "Only one developer should edit a module"], "ans": 0},
    {"q": "What is a Mutex (Mutual Exclusion) in concurrent programming?", "opts": ["A locking mechanism used to synchronize access to a resource across threads", "A multi-threaded queue", "A CPU register", "A dead thread detector"], "ans": 0},
    {"q": "What is the difference between a Process and a Thread?", "opts": ["Processes share virtual memory space; Threads have isolated memory", "Threads share the virtual memory space of their parent process; Processes have isolated memory spaces", "Processes are faster than threads", "Threads cannot execute concurrently"], "ans": 1},
    {"q": "What is Copy-on-Write (CoW) in operating systems and memory management?", "opts": ["Writing data twice to disk", "Optimization strategy where resource copy is deferred until a modification is attempted", "A security permissions policy", "A database write-ahead log"], "ans": 1},
    {"q": "What is a Write-Ahead Log (WAL) in database engine architecture?", "opts": ["Log of users who wrote to table", "Log where changes are written before being applied to storage for crash recovery", "An analytics reporting queue", "A security access log"], "ans": 1},
    {"q": "What is Rate Limiting in API design?", "opts": ["Limiting query execution time", "Controlling the number of incoming requests a client can make in a given timeframe", "Restricting database connections", "Throttling CPU usage"], "ans": 1},
    {"q": "What is the primary vulnerability targeted by SQL Injection?", "opts": ["Unsanitized user inputs concatenated directly into dynamic SQL queries", "Weak password hashes", "Unencrypted SSL connections", "Cross-site request forgery"], "ans": 0},
    {"q": "What is Cross-Site Scripting (XSS)?", "opts": ["Vulnerability allowing attackers to inject malicious client-side scripts into web pages viewed by users", "A server crash technique", "A database leak via API", "Bypassing CORS headers"], "ans": 0},
    {"q": "What is Cross-Site Request Forgery (CSRF)?", "opts": ["Injecting scripts into HTML", "Tricking an authenticated victim into submitting unauthorized requests to a web application", "Intercepting DNS packets", "SQL query modification"], "ans": 1},
    {"q": "What is the primary benefit of gRPC over REST/JSON for microservice communication?", "opts": ["Uses HTTP/2 with Protocol Buffers for fast, strongly-typed binary serialization", "Easier to inspect in browser dev tools", "Requires no schema", "Uses plain text for debugging"], "ans": 0},
]


def get_fallback_quiz(difficulty):
    """Returns 10 randomly selected and shuffled fallback questions based on difficulty."""
    bank = {
        'easy': FALLBACK_QUIZ_EASY,
        'medium': FALLBACK_QUIZ_MEDIUM,
        'hard': FALLBACK_QUIZ_HARD,
    }.get(str(difficulty).lower(), FALLBACK_QUIZ_MEDIUM)
    
    # Sample 10 unique questions from the bank
    count = min(10, len(bank))
    selected = random.sample(bank, count)
    
    # Deep copy and shuffle options so options order varies per room
    shuffled_questions = []
    for item in selected:
        opts = list(item["opts"])
        correct_text = opts[item["ans"]]
        random.shuffle(opts)
        new_ans = opts.index(correct_text)
        shuffled_questions.append({
            "q": item["q"],
            "opts": opts,
            "ans": new_ans
        })
    return shuffled_questions


@api_view(['POST'])
@permission_classes([AllowAny])
def create_room(request):
    room_code = request.data.get('room_code')
    host_player = request.data.get('player')
    host_player_id = request.data.get('playerId') or request.data.get('player_id')
    game_mode = request.data.get('mode', 'coding')
    difficulty = request.data.get('difficulty', 'easy')

    if not room_code or not host_player or not host_player_id:
        return Response({"error": "Missing required fields"}, status=400)

    # Clean up existing room with same code if any
    BattleRoom.objects.filter(room_code=room_code).delete()

    quiz_data = None
    if game_mode == 'quiz':
        # Try AI generation first with Gemini/Groq fallback
        try:
            from users.interview_service import get_gemini_response, clean_json_response
            import uuid
            prompt = f"""
            Generate exactly 10 UNIQUE multiple choice questions about computer science and programming for difficulty level '{difficulty}'.
            Unique Seed: {uuid.uuid4()}
            Provide output ONLY in JSON format as a list of objects.
            Each object must have exactly these keys:
            - "q": The question string
            - "opts": A list of exactly 4 string options
            - "ans": An integer index (0-3) of the correct option.
            Return json array only.
            """
            raw = get_gemini_response(prompt)
            quiz_data = json.loads(clean_json_response(raw))
            if not isinstance(quiz_data, list) or len(quiz_data) < 5:
                raise ValueError("AI returned insufficient quiz data")
        except Exception as e:
            print(f"AI quiz generation failed ({e}), switching to 100+ local question bank fallback.")
            quiz_data = get_fallback_quiz(difficulty)

    room = BattleRoom.objects.create(
        room_code=room_code,
        host_player=host_player,
        host_player_id=host_player_id,
        game_mode=game_mode,
        difficulty=difficulty,
        status='waiting',
        quiz_data=quiz_data
    )
    
    return Response({"success": True, "room_code": room.room_code})


@api_view(['POST'])
@permission_classes([AllowAny])
def join_room(request):
    room_code = request.data.get('room_code')
    join_player = request.data.get('player')
    join_player_id = request.data.get('playerId') or request.data.get('player_id')

    if not room_code or not join_player or not join_player_id:
        return Response({"error": "Missing required fields"}, status=400)

    try:
        room = BattleRoom.objects.get(room_code=room_code)
    except BattleRoom.DoesNotExist:
        return Response({"error": "Room not found"}, status=404)

    # If host is re-joining
    if room.host_player_id == join_player_id:
        return Response({
            "success": True,
            "mode": room.game_mode,
            "difficulty": room.difficulty,
            "opponent": room.join_player,
            "quiz_data": room.quiz_data
        })

    # If room is already full with another player
    if room.status != 'waiting' and room.join_player_id and room.join_player_id != join_player_id:
        return Response({"error": "Room is full or game already started"}, status=400)

    room.join_player = join_player
    room.join_player_id = join_player_id
    room.status = 'playing'
    room.save()

    return Response({
        "success": True, 
        "mode": room.game_mode, 
        "difficulty": room.difficulty,
        "opponent": room.host_player,
        "quiz_data": room.quiz_data
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def sync_room(request, room_code):
    try:
        room = BattleRoom.objects.get(room_code=room_code)
    except BattleRoom.DoesNotExist:
        return Response({"error": "Room not found"}, status=404)

    return Response({
        "status": room.status,
        "host_player": room.host_player,
        "host_player_id": room.host_player_id,
        "join_player": room.join_player,
        "join_player_id": room.join_player_id,
        "game_mode": room.game_mode,
        "difficulty": room.difficulty,
        "winner": room.winner,
        "quiz_data": room.quiz_data,
        "host_score": room.host_score,
        "host_time": room.host_time,
        "host_submitted": room.host_submitted,
        "join_score": room.join_score,
        "join_time": room.join_time,
        "join_submitted": room.join_submitted
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_code(request):
    room_code = request.data.get('room_code')
    player = request.data.get('player')
    player_id = request.data.get('playerId') or request.data.get('player_id')
    score = request.data.get('score', 0)
    time_taken = request.data.get('time_taken', 0)

    if not room_code or not player:
        return Response({"error": "Missing required fields"}, status=400)

    try:
        room = BattleRoom.objects.get(room_code=room_code)
    except BattleRoom.DoesNotExist:
        return Response({"error": "Room not found"}, status=404)

    if room.status not in ['playing', 'finished']:
        return Response({"success": False, "message": "Game not active"})

    # Determine if submitting player is Host or Join using unique player_id first, falling back to player name
    is_host = False
    is_join = False

    if player_id:
        if player_id == room.host_player_id:
            is_host = True
        elif player_id == room.join_player_id:
            is_join = True

    if not is_host and not is_join:
        # Fallback to name-based match if player_id wasn't available
        if player == room.host_player and not room.host_submitted:
            is_host = True
        elif player == room.join_player and not room.join_submitted:
            is_join = True
        elif player == room.host_player:
            is_host = True
        else:
            is_join = True

    if is_host:
        room.host_score = score
        room.host_time = time_taken
        room.host_submitted = True
    else:
        room.join_score = score
        room.join_time = time_taken
        room.join_submitted = True
        
    room.save()

    if room.game_mode == 'coding':
        # Coding mode: first player to submit code wins
        if not room.winner:
            room.winner = player
            room.status = 'finished'
            room.save()
    elif room.game_mode == 'quiz':
        # Quiz mode: calculate winner once both players submit (or timer expires)
        if room.host_submitted and room.join_submitted:
            if room.host_score > room.join_score:
                room.winner = room.host_player
            elif room.join_score > room.host_score:
                room.winner = room.join_player
            else:
                # Tie breaker: lower time taken wins
                if room.host_time < room.join_time:
                    room.winner = room.host_player
                elif room.join_time < room.host_time:
                    room.winner = room.join_player
                else:
                    room.winner = "Draw"
            room.status = 'finished'
            room.save()
        elif room.host_submitted or room.join_submitted:
            # If time is up (300s) for one player or time limit reached, mark game finished
            if time_taken >= 300:
                if room.host_submitted and not room.join_submitted:
                    room.winner = room.host_player
                elif room.join_submitted and not room.host_submitted:
                    room.winner = room.join_player
                else:
                    room.winner = "Draw"
                room.status = 'finished'
                room.save()

    return Response({
        "success": True, 
        "winner": room.winner,
        "status": room.status,
        "host_submitted": room.host_submitted,
        "join_submitted": room.join_submitted
    })
