import torch
from torch.utils.data import DataLoader
from transformers import BertTokenizer, BertForSequenceClassification
from torch.optim import SGD
from datasets import load_dataset

# Load dataset
dataset = load_dataset("imdb")

# Tokenization
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
def tokenize(batch):
    return tokenizer(batch["text"], padding="max_length", truncation=True, max_length=128)
tokenized_dataset = dataset.map(tokenize, batched=True)
tokenized_dataset.set_format(type="torch", columns=["input_ids", "attention_mask", "label"])

# DataLoaders
batch_size = 16
train_loader = DataLoader(tokenized_dataset["train"], batch_size=batch_size, shuffle=True)
test_loader = DataLoader(tokenized_dataset["test"], batch_size=batch_size)

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Model
model = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)
model.to(device)

# Optimizer
optimizer = SGD(model.parameters(), lr=0.01)

# Training loop
epochs = 2
for epoch in range(epochs):
    model.train()
    total_loss = 0
    for batch in train_loader:
        input_ids = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        labels = batch["label"].to(device)

        outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
        loss = outputs.loss

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    print(f"Epoch {epoch+1}, Average Loss: {total_loss/len(train_loader):.4f}")

# Save trained model
model.save_pretrained("bert_imdb_model")
tokenizer.save_pretrained("bert_imdb_model")
print("Model saved to 'bert_imdb_model/'")
