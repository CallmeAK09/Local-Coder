class HashTable:
    def __init__(self, size):
        self.size = size
        self.table = [[] for _ in range(self.size)]
        
    def hash_function(self, key):
        index = hash(key) % self.size
        return index
        
    def insert(self, data):
        indx = self.hash_function(data[0])
        bucket = self.table[indx]
        
        if bucket and bucket == []:
            bucket.append(data)
        
        
    def display(self):
        for i, v in enumerate(self.table):
            print(f"{i} : {v}")
        
    def search(self, key):
        indx = self.hash_function(key)
        bucket = self.table[indx]
        
        if key == bucket[0][0]:
            print(f"{bucket[0][0]}:{bucket[0][1]}")
        else:
            print(f"No data with key {key}")
        
        
h = HashTable(10)
datas = [
('a',1),
('b',2),
('c',3),
('d',4),
('e',5),
]

for d in datas:
    h.insert(d)
    
h.display()
h.search('a')

