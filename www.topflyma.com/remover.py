from bs4 import BeautifulSoup
import os

def remove_lazy_loading(directory):
    # Iterate through all files in the specified directory
    for filename in os.listdir(directory):
        # Check if the file is an HTML file
        if filename.endswith('.html'):
            file_path = os.path.join(directory, filename)
            
            # Read the contents of the HTML file
            with open(file_path, 'r', encoding='utf-8') as file:
                soup = BeautifulSoup(file.read(), 'html.parser')

            # Find all images with lazy loading
            images = soup.find_all('img')
            for img in images:
                # Get the real src from data-original or data-src
                real_src = img.get('data-original') or img.get('data-src')
                # if real_src:
                #     img['src'] = real_src  # Replace src with the actual image URL
                #     # Optionally, remove the lazy loading attributes
                #     #img.pop('data-original', None)
                #     #img.pop('data-src', None)

            # Write the modified HTML back to the file
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(str(soup))

            print(f"Processed {filename}")

# Example usage
directory_path = os.path.dirname(os.path.abspath(__file__))

remove_lazy_loading(directory_path)
