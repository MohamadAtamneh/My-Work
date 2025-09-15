import torch
from torch.utils.data import DataLoader
from transformers import BertTokenizer, BertForSequenceClassification
from datasets import load_dataset
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt

# Load model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = BertForSequenceClassification.from_pretrained("bert_imdb_model").to(device)
tokenizer = BertTokenizer.from_pretrained("bert_imdb_model")

# Load dataset
dataset = load_dataset("imdb")
def tokenize(batch):
    return tokenizer(batch["text"], padding="max_length", truncation=True, max_length=128)
tokenized_dataset = dataset.map(tokenize, batched=True)
tokenized_dataset.set_format(type="torch", columns=["input_ids", "attention_mask", "label"])
test_loader = DataLoader(tokenized_dataset["test"], batch_size=16)

# Evaluation
model.eval()
all_labels = []
all_predictions = []

with torch.no_grad():
    for batch in test_loader:
        input_ids = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        labels = batch["label"].to(device)

        outputs = model(input_ids, attention_mask=attention_mask)
        logits = outputs.logits
        predictions = logits.argmax(dim=1)

        all_labels.extend(labels.cpu().numpy())
        all_predictions.extend(predictions.cpu().numpy())

# Accuracy & Error Rate
correct = sum([p == l for p, l in zip(all_predictions, all_labels)])
total = len(all_labels)
accuracy = correct / total
error_rate = 1 - accuracy

print(f"Test Accuracy: {accuracy:.4f}")
print(f"Test Error Rate: {error_rate:.4f}")

# Confusion Matrix
cm = confusion_matrix(all_labels, all_predictions)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Negative", "Positive"])
disp.plot(cmap=plt.cm.Blues)
plt.show()
