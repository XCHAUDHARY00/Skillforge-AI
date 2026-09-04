from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import BattleRoom
import json
import random

# ── 100+ B.Tech CS Placement Focused Question Bank ─────────────────────────────

FALLBACK_QUIZ_EASY = [
    # Data Structures & Basics
    {"q": "Which data structure operates on LIFO (Last In First Out) principle?", "opts": ["Stack", "Queue", "Array", "Linked List"], "ans": 0},
    {"q": "Which data structure operates on FIFO (First In First Out) principle?", "opts": ["Queue", "Stack", "Binary Tree", "Heap"], "ans": 0},
    {"q": "What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?", "opts": ["O(log n)", "O(n)", "O(1)", "O(n log n)"], "ans": 0},
    {"q": "What is the worst-case time complexity of Linear Search on an array of size n?", "opts": ["O(n)", "O(1)", "O(log n)", "O(n²)"], "ans": 0},
    {"q": "Which of the following is a non-linear data structure?", "opts": ["Tree", "Stack", "Queue", "Array"], "ans": 0},
    {"q": "What is the size of an int pointer on a 64-bit operating system?", "opts": ["8 bytes", "4 bytes", "2 bytes", "16 bytes"], "ans": 0},
    {"q": "In C++, which keyword is used to allocate dynamic memory?", "opts": ["new", "malloc", "alloc", "create"], "ans": 0},
    {"q": "In Java, which keyword prevents a method from being overridden by subclasses?", "opts": ["final", "static", "const", "abstract"], "ans": 0},
    {"q": "Which SQL clause is used to filter rows before grouping?", "opts": ["WHERE", "HAVING", "ORDER BY", "GROUP BY"], "ans": 0},
    {"q": "Which SQL clause is used to filter aggregated groups?", "opts": ["HAVING", "WHERE", "ORDER BY", "SELECT"], "ans": 0},
    {"q": "What is the default port number for HTTP?", "opts": ["80", "443", "8080", "22"], "ans": 0},
    {"q": "What is the default port number for HTTPS?", "opts": ["443", "80", "21", "3306"], "ans": 0},
    {"q": "Which HTTP method is idempotent and used to retrieve server resources?", "opts": ["GET", "POST", "PATCH", "CONNECT"], "ans": 0},
    {"q": "Which OOP pillar allows wrapping code and data together into a single unit?", "opts": ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"], "ans": 0},
    {"q": "Which OOP pillar enables one class to acquire properties of another class?", "opts": ["Inheritance", "Encapsulation", "Polymorphism", "Abstraction"], "ans": 0},
    {"q": "What is the index of the first element in standard C/C++/Java arrays?", "opts": ["0", "1", "-1", "Depends on size"], "ans": 0},
    {"q": "Which header file is required for dynamic memory allocation functions (malloc/free) in C?", "opts": ["<stdlib.h>", "<stdio.h>", "<string.h>", "<math.h>"], "ans": 0},
    {"q": "In C++, which operator is overloaded for standard output printing?", "opts": ["<<", ">>", "->", "::"], "ans": 0},
    {"q": "Which symbol represents the address-of operator in C/C++?", "opts": ["&", "*", "->", "%"], "ans": 0},
    {"q": "Which symbol represents the dereference operator in C/C++?", "opts": ["*", "&", "->", "."], "ans": 0},
    {"q": "What is the time complexity of accessing an array element by index?", "opts": ["O(1)", "O(n)", "O(log n)", "O(n²)"], "ans": 0},
    {"q": "Which OSI layer is responsible for routing IP packets across networks?", "opts": ["Network Layer", "Transport Layer", "Data Link Layer", "Physical Layer"], "ans": 0},
    {"q": "Which OSI layer provides reliable end-to-end communication and flow control?", "opts": ["Transport Layer", "Network Layer", "Session Layer", "Application Layer"], "ans": 0},
    {"q": "What does SQL stand for?", "opts": ["Structured Query Language", "Simple Query Logic", "Sequential Question Language", "System Query Link"], "ans": 0},
    {"q": "Which SQL command is used to add new rows to a table?", "opts": ["INSERT INTO", "ADD ROW", "UPDATE", "CREATE"], "ans": 0},
    {"q": "Which Git command records staged changes to local repository history?", "opts": ["git commit", "git push", "git add", "git save"], "ans": 0},
    {"q": "Which Git command uploads local commits to a remote server?", "opts": ["git push", "git pull", "git commit", "git fetch"], "ans": 0},
    {"q": "What is the time complexity of Binary Search on a sorted array?", "opts": ["O(log n)", "O(n)", "O(1)", "O(n log n)"], "ans": 0},
    {"q": "Which sorting algorithm has the best-case time complexity of O(n) for already sorted arrays?", "opts": ["Insertion Sort", "Selection Sort", "Quick Sort", "Merge Sort"], "ans": 0},
    {"q": "In Python, which built-in function returns the number of items in a container?", "opts": ["len()", "size()", "length()", "count()"], "ans": 0},
    {"q": "Which data structure is best for checking if an element exists in O(1) average time?", "opts": ["Hash Set / Hash Table", "Array", "Linked List", "Binary Tree"], "ans": 0},
    {"q": "What is the HTTP response status code for 'Page Not Found'?", "opts": ["404", "200", "500", "403"], "ans": 0},
    {"q": "What is the HTTP response status code for 'Unauthorized'?", "opts": ["401", "403", "400", "404"], "ans": 0},
    {"q": "What is the HTTP response status code for 'Internal Server Error'?", "opts": ["500", "502", "404", "400"], "ans": 0},
    {"q": "In C++, which keyword is used to inherit a class privately by default?", "opts": ["class", "struct", "public", "virtual"], "ans": 0},
    {"q": "In C++, what is default access specifier for members of a `class`?", "opts": ["private", "public", "protected", "internal"], "ans": 0},
    {"q": "In C++, what is default access specifier for members of a `struct`?", "opts": ["public", "private", "protected", "friend"], "ans": 0},
    {"q": "Which Data Structure is used by function calls for maintaining call frames?", "opts": ["Call Stack", "Queue", "Heap Memory", "Tree"], "ans": 0},
    {"q": "What does DBMS stand for?", "opts": ["Database Management System", "Data Base Main Storage", "Digital Byte Management Set", "Data Binary Module System"], "ans": 0},
    {"q": "Which logical gate outputs 1 only when both input bits are 1?", "opts": ["AND", "OR", "XOR", "NAND"], "ans": 0},
]

FALLBACK_QUIZ_MEDIUM = [
    # B.Tech CS Core: Operating Systems, DBMS, DSA, Networks
    {"q": "What is the worst-case time complexity of QuickSort?", "opts": ["O(n²)", "O(n log n)", "O(n)", "O(log n)"], "ans": 0},
    {"q": "What is the average time complexity of MergeSort?", "opts": ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], "ans": 0},
    {"q": "Which algorithm is used to find the shortest path from a single source node in a weighted graph with positive weights?", "opts": ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Floyd-Warshall Algorithm", "Kruskal's Algorithm"], "ans": 0},
    {"q": "Which algorithm is used to find Minimum Spanning Tree (MST) using greedy edge selection?", "opts": ["Kruskal's Algorithm", "Dijkstra's Algorithm", "Floyd-Warshall Algorithm", "BFS"], "ans": 0},
    {"q": "What is a Deadlock in Operating Systems?", "opts": ["A situation where a set of processes are blocked because each holds a resource and waits for another held by another process", "A process consuming 100% CPU", "A memory leak", "An unhandled null pointer exception"], "ans": 0},
    {"q": "Which of the following is NOT one of Coffman's 4 necessary conditions for Deadlock?", "opts": ["Preemption Allowed", "Mutual Exclusion", "Hold and Wait", "Circular Wait"], "ans": 0},
    {"q": "What is Virtual Memory in Operating Systems?", "opts": ["A memory management technique that gives an application the illusion of having contiguous working memory larger than physical RAM", "High-speed cache inside CPU", "RAM installed on GPU", "Cloud storage bucket"], "ans": 0},
    {"q": "What is Paging in OS memory management?", "opts": ["Dividing physical memory into fixed-size blocks called frames and virtual memory into same-sized pages", "Swapping entire processes to disk", "Dynamic memory allocation in heap", "CPU register allocation"], "ans": 0},
    {"q": "What does ACID stand for in DBMS transactions?", "opts": ["Atomicity, Consistency, Isolation, Durability", "Availability, Consistency, Integrity, Durability", "Access, Control, Isolation, Data", "Atomicity, Concurrency, Indexing, Durability"], "ans": 0},
    {"q": "Which normal form eliminates partial dependency in relational database design?", "opts": ["Second Normal Form (2NF)", "First Normal Form (1NF)", "Third Normal Form (3NF)", "BCNF"], "ans": 0},
    {"q": "Which normal form eliminates transitive dependency in relational database design?", "opts": ["Third Normal Form (3NF)", "Second Normal Form (2NF)", "First Normal Form (1NF)", "Fourth Normal Form (4NF)"], "ans": 0},
    {"q": "What is a Foreign Key in relational databases?", "opts": ["A field in one table that uniquely identifies a row in another table", "A primary key with auto-increment", "An index used for full-text search", "A key used for encrypting database files"], "ans": 0},
    {"q": "Which protocol works at the Transport Layer and guarantees reliable, ordered packet delivery?", "opts": ["TCP", "UDP", "IP", "ICMP"], "ans": 0},
    {"q": "Which protocol works at the Transport Layer and is connectionless, prioritizing speed over reliability?", "opts": ["UDP", "TCP", "HTTP", "FTP"], "ans": 0},
    {"q": "What is the 3-way handshake mechanism used in TCP connection establishment?", "opts": ["SYN -> SYN-ACK -> ACK", "ACK -> SYN -> FIN", "CONNECT -> ACCEPT -> READY", "REQ -> RES -> CONFIRM"], "ans": 0},
    {"q": "What is the time complexity of inserting an element into a Heap of size n?", "opts": ["O(log n)", "O(1)", "O(n)", "O(n log n)"], "ans": 0},
    {"q": "Which traversal of a Binary Search Tree (BST) produces nodes in sorted ascending order?", "opts": ["In-order Traversal", "Pre-order Traversal", "Post-order Traversal", "Level-order Traversal"], "ans": 0},
    {"q": "What is the time complexity of Breadth-First Search (BFS) on a graph with V vertices and E edges?", "opts": ["O(V + E)", "O(V * E)", "O(V²)", "O(E log V)"], "ans": 0},
    {"q": "What is the difference between a Process and a Thread?", "opts": ["Threads share memory space of parent process; Processes have separate isolated memory spaces", "Processes share memory; Threads do not", "Threads are independent applications; Processes are sub-components", "Processes cannot run concurrently"], "ans": 0},
    {"q": "In Java, what is Garbage Collection?", "opts": ["Automatic memory management process that frees memory occupied by objects no longer reachable", "Deleting unused source files", "Clearing database tables", "Freeing CPU cache"], "ans": 0},
    {"q": "In C++, what is a Virtual Function used for?", "opts": ["Achieving runtime polymorphism (dynamic binding)", "Achieving compile-time function overloading", "Inline memory allocation", "Private access control"], "ans": 0},
    {"q": "What is a Pure Virtual Function in C++?", "opts": ["A function declared with `= 0` that must be overridden by derived classes", "A function with no return type", "A function marked static", "A constructor without parameters"], "ans": 0},
    {"q": "What is an Abstract Class in C++/Java?", "opts": ["A class that cannot be instantiated directly and contains at least one pure virtual/abstract method", "A class with all static methods", "A class with no variables", "A final class"], "ans": 0},
    {"q": "What is Method Overloading?", "opts": ["Defining multiple methods in the same class with the same name but different parameter signatures", "Overriding a superclass method in a child class", "Calling a method recursively", "Passing extra arguments to a function"], "ans": 0},
    {"q": "What is Method Overriding?", "opts": ["Providing a specific implementation of a method in a child class that is already defined in superclass", "Defining methods with different parameters in same class", "Hiding static variables", "Deleting a superclass method"], "ans": 0},
    {"q": "What is the primary advantage of a B-Tree index in database engines?", "opts": ["Keeps data sorted and allows fast searches, sequential access, insertions, and deletions in logarithmic time on disk storage", "Uses 0 RAM", "Encrypts all table rows", "Enforces foreign keys"], "ans": 0},
    {"q": "Which data structure is used to implement LRU (Least Recently Used) Cache efficiently?", "opts": ["Hash Map + Doubly Linked List", "Single Array", "Binary Heap", "Stack"], "ans": 0},
    {"q": "What is the worst-case space complexity of Depth-First Search (DFS) on a tree of height h?", "opts": ["O(h)", "O(n²)", "O(1)", "O(2^h)"], "ans": 0},
    {"q": "What is the main difference between SQL and NoSQL databases?", "opts": ["SQL databases are relational with structured schemas; NoSQL databases are non-relational with flexible schemas", "SQL databases don't support indexes", "NoSQL databases don't support queries", "SQL databases run only on Windows"], "ans": 0},
    {"q": "What is a Semaphore in Operating Systems?", "opts": ["A synchronization variable used to control access to common resources by multiple processes", "A CPU clock signal", "A network routing packet", "A disk partition header"], "ans": 0},
    {"q": "What is a Mutex (Mutual Exclusion)?", "opts": ["A locking mechanism used to ensure only one thread accesses a critical section at a time", "A multi-core CPU feature", "A database backup lock", "A memory expansion protocol"], "ans": 0},
    {"q": "In OS scheduling, what is Round Robin scheduling?", "opts": ["Preemptive scheduling algorithm where each process gets a fixed time slot (time quantum) in cyclic order", "Non-preemptive algorithm favoring shortest jobs", "Priority algorithm based on process age", "First Come First Served scheduling"], "ans": 0},
    {"q": "What is Thrashing in Operating Systems?", "opts": ["High paging activity where the system spends more time swapping pages than executing instructions", "A CPU hardware failure", "Hard drive disk corruption", "A network denial-of-service attack"], "ans": 0},
    {"q": "What does DNS stand for in Computer Networks?", "opts": ["Domain Name System", "Digital Network Server", "Direct Node Service", "Data Network Routing"], "ans": 0},
    {"q": "Which port is used by MySQL database server by default?", "opts": ["3306", "5432", "27017", "6379"], "ans": 0},
    {"q": "Which port is used by PostgreSQL database server by default?", "opts": ["5432", "3306", "8080", "1521"], "ans": 0},
    {"q": "Which port is used by Redis in-memory cache by default?", "opts": ["6379", "27017", "3306", "80"], "ans": 0},
    {"q": "Which port is used by MongoDB database by default?", "opts": ["27017", "6379", "5432", "3306"], "ans": 0},
    {"q": "What is the time complexity of checking if a graph has a cycle using Union-Find algorithm?", "opts": ["O(E * α(V))", "O(V²)", "O(V * E)", "O(2^V)"], "ans": 0},
    {"q": "In Dynamic Programming, what are the two core properties required for a problem to be solvable via DP?", "opts": ["Optimal Substructure and Overlapping Subproblems", "Greedy Choice and Divide & Conquer", "Recursion and Memory Swapping", "Sorting and Binary Search"], "ans": 0},
]

FALLBACK_QUIZ_HARD = [
    # Advanced B.Tech CS Placement Topics: System Design, Advanced DSA, OS, Distributed Systems
    {"q": "What does the CAP Theorem state for distributed data systems?", "opts": ["A distributed system can guarantee at most 2 out of 3 properties: Consistency, Availability, and Partition Tolerance", "Systems can easily achieve all 3 simultaneously", "Consistency is only required in SQL databases", "Partition tolerance is optional in network systems"], "ans": 0},
    {"q": "What is the Banker's Algorithm used for in Operating Systems?", "opts": ["Deadlock Avoidance by testing for safe allocation states", "CPU process scheduling", "Page replacement in virtual memory", "Disk arm scheduling"], "ans": 0},
    {"q": "What is the time complexity of Bellman-Ford algorithm for finding shortest paths in a graph with V vertices and E edges?", "opts": ["O(V * E)", "O(V + E)", "O(V² log V)", "O(E log V)"], "ans": 0},
    {"q": "What is the worst-case space complexity of a Trie containing N words of maximum length L?", "opts": ["O(N * L * Σ) where Σ is alphabet size", "O(N)", "O(L)", "O(N²)"], "ans": 0},
    {"q": "In B+ Trees used in database indexes, where are data pointers stored?", "opts": ["Only in leaf nodes (linked sequentially)", "In every node of the tree", "Only in the root node", "In external hash files"], "ans": 0},
    {"q": "What is a Bloom Filter data structure?", "opts": ["A space-efficient probabilistic data structure used to test whether an element is definitely NOT in a set or MIGHT be in a set", "A tree traversal algorithm", "A cryptographic hash algorithm", "A page replacement algorithm"], "ans": 0},
    {"q": "What is the time complexity of Floyd-Warshall All-Pairs Shortest Path algorithm?", "opts": ["O(V³)", "O(V² log V)", "O(V * E)", "O(E log V)"], "ans": 0},
    {"q": "What is a Write-Ahead Log (WAL) in database engine architectures?", "opts": ["A log file where database changes are recorded before being committed to main database files for crash recovery", "An access log of user queries", "A backup mechanism", "A query cache index"], "ans": 0},
    {"q": "In System Design, what is Rate Limiting used for?", "opts": ["Throttling incoming API requests from a client to prevent server overload and abuse", "Limiting database size", "Speeding up network bandwidth", "Compressing HTTP responses"], "ans": 0},
    {"q": "What is the Circuit Breaker design pattern in microservice architecture?", "opts": ["Preventing cascading service failures by stopping calls to a failing dependent service", "Managing database connections", "Encrypting user tokens", "Distributed load balancing"], "ans": 0},
    {"q": "What is Database Sharding?", "opts": ["Horizontal partitioning of data across multiple database server instances", "Encrypting sensitive columns", "Creating read-only replicas", "Indexing primary keys"], "ans": 0},
    {"q": "What is the amortized time complexity of inserting an element into a Dynamic Array (e.g. C++ vector or JS array)?", "opts": ["O(1)", "O(n)", "O(log n)", "O(n²)"], "ans": 0},
    {"q": "Which design pattern ensures only one instance of a class exists throughout application lifetime?", "opts": ["Singleton Pattern", "Factory Pattern", "Observer Pattern", "Strategy Pattern"], "ans": 0},
    {"q": "Which design pattern creates objects without specifying the exact class of object that will be created?", "opts": ["Factory Pattern", "Singleton Pattern", "Decorator Pattern", "Adapter Pattern"], "ans": 0},
    {"q": "What is Copy-on-Write (CoW) in OS process management (e.g. `fork()` system call)?", "opts": ["Child and parent process share same physical memory pages until one attempts to write, triggering a copy", "Writing data twice to hard disk", "Backup disk mirroring", "Copying memory at process start"], "ans": 0},
    {"q": "What is the main difference between Strong Consistency and Eventual Consistency?", "opts": ["Strong consistency guarantees immediate read of latest write; Eventual consistency converges over time", "Eventual consistency is faster to read latest write", "Strong consistency only works on single node", "They are identical"], "ans": 0},
    {"q": "What is a Segment Tree data structure used for?", "opts": ["Efficiently answering range queries (e.g. range sum/min/max) and range updates in O(log n) time", "Sorting numbers in O(n) time", "Storing graph edges", "Hashing strings"], "ans": 0},
    {"q": "What is the time complexity of building a Binary Heap from an unsorted array of n elements using Floyd's build-heap algorithm?", "opts": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], "ans": 0},
    {"q": "What is the time complexity of Tarjan's algorithm for finding Strongly Connected Components (SCC) in a directed graph?", "opts": ["O(V + E)", "O(V * E)", "O(V²)", "O(V³)"], "ans": 0},
    {"q": "What is the Liskov Substitution Principle (L in SOLID principles)?", "opts": ["Objects of a superclass should be replaceable with objects of a subclass without breaking application correctness", "Classes should be open for extension and closed for modification", "High level modules should not depend on low level modules", "Interfaces should be small and specific"], "ans": 0},
    {"q": "What is the Open-Closed Principle (O in SOLID principles)?", "opts": ["Software entities should be open for extension, but closed for modification", "Single responsibility per module", "Subclasses must substitute superclass", "Interface segregation"], "ans": 0},
    {"q": "What is the Dependency Inversion Principle (D in SOLID principles)?", "opts": ["High-level modules should not depend on low-level modules; both should depend on abstractions", "Classes should extend from single parent", "Functions must have single responsibility", "Code must be open for modification"], "ans": 0},
    {"q": "What is a Distributed Lock (e.g. Redlock algorithm in Redis)?", "opts": ["A lock shared across multiple server nodes to synchronize access to shared distributed resources", "A hardware CPU lock", "A local database table lock", "A browser cookie lock"], "ans": 0},
    {"q": "In System Design, what is the primary role of a Reverse Proxy (e.g. Nginx)?", "opts": ["Routing client requests to backend servers, providing load balancing, SSL termination, and security", "Database indexing", "Compiling client code", "Storing user passwords"], "ans": 0},
    {"q": "What is the primary vulnerability targeted by SQL Injection attacks?", "opts": ["Unsanitized user input directly concatenated into SQL query strings", "Weak password hashes", "Unencrypted SSL connections", "Cross-site request forgery"], "ans": 0},
    {"q": "What is Cross-Site Scripting (XSS)?", "opts": ["Attacker injecting malicious client-side scripts into web pages viewed by other users", "Server crash technique", "SQL database extraction", "CSRF token bypass"], "ans": 0},
    {"q": "What is Cross-Site Request Forgery (CSRF)?", "opts": ["Tricking an authenticated victim's browser into sending unauthorized requests to a web app", "Injecting JavaScript into HTML", "Interception of DNS traffic", "Database table deletion"], "ans": 0},
    {"q": "What is gRPC protocol advantage over traditional REST over HTTP/1.1?", "opts": ["Uses HTTP/2 with Protocol Buffers for high performance, binary serialization, and bi-directional streaming", "Plain text JSON output", "No schema definition required", "Works without network connection"], "ans": 0},
    {"q": "In OS virtual memory, what is Belady's Anomaly?", "opts": ["For certain page replacement algorithms (like FIFO), increasing page frames can increase page faults", "CPU overheating under load", "Paging file corruption", "Disk speed reduction"], "ans": 0},
    {"q": "What is the worst-case time complexity of KMP (Knuth-Morris-Pratt) pattern matching algorithm for text of length N and pattern of length M?", "opts": ["O(N + M)", "O(N * M)", "O(N²)", "O(M²)"], "ans": 0},
]


def get_fallback_quiz(difficulty):
    """Returns 10 randomly selected and option-shuffled B.Tech placement quiz questions based on difficulty."""
    bank = {
        'easy': FALLBACK_QUIZ_EASY,
        'medium': FALLBACK_QUIZ_MEDIUM,
        'hard': FALLBACK_QUIZ_HARD,
    }.get(str(difficulty).lower(), FALLBACK_QUIZ_MEDIUM)
    
    # Sample 10 unique placement questions from the bank
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
            Generate exactly 10 UNIQUE multiple choice questions for B.Tech CS/IT Technical Placement Interviews at difficulty level '{difficulty}'.
            Topics to cover: Data Structures & Algorithms, Operating Systems, DBMS/SQL, Computer Networks, OOP (C++/Java/Python).
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
            print(f"AI quiz generation failed ({e}), switching to B.Tech Placement question bank fallback.")
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
def flee_room(request):
    """Called when a player flees/leaves room. Remaining player automatically wins."""
    room_code = request.data.get('room_code')
    player = request.data.get('player')
    player_id = request.data.get('playerId') or request.data.get('player_id')

    if not room_code:
        return Response({"error": "Missing room code"}, status=400)

    try:
        room = BattleRoom.objects.get(room_code=room_code)
    except BattleRoom.DoesNotExist:
        return Response({"error": "Room not found"}, status=404)

    if room.status != 'finished':
        if player_id == room.host_player_id or player == room.host_player:
            room.winner = room.join_player or "Opponent"
        else:
            room.winner = room.host_player or "Host"
        room.status = 'finished'
        room.save()

    return Response({"success": True, "winner": room.winner})


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

    # Determine if submitting player is Host or Join using unique player_id first
    is_host = False
    is_join = False

    if player_id:
        if player_id == room.host_player_id:
            is_host = True
        elif player_id == room.join_player_id:
            is_join = True

    if not is_host and not is_join:
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
