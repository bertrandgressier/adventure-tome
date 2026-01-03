/**
 * Script de test à exécuter dans la console du navigateur
 * pour ajouter des items de différents types et tester la feature V2
 *
 * Usage:
 * 1. Ouvrez la console du navigateur (F12 ou Cmd+Option+I)
 * 2. Allez sur la page d'un personnage
 * 3. Copiez et collez ce script dans la console
 */

(function() {
  'use strict';

  // Fonction pour ajouter un item via le store
  window.addTestItems = async function(characterId) {
    if (!characterId) {
      console.error('❌ Veuillez fournir l\'ID du personnage');
      console.log('💡 Usage: addTestItems("<character-id>")');
      console.log('💡 L\'ID du personnage est dans l\'URL: /characters/<id>');
      return;
    }

    const itemsToAdd = [
      // BASIC items
      { name: 'Torche', type: 'basic', possessed: true, effect: 'Une torche simple' },
      { name: 'Clé rouillée', type: 'basic', possessed: true, effect: 'Pour ouvrir la porte' },

      // PASSIVE items
      { name: 'Collier de charisme', type: 'passive', possessed: true, effect: '+2 en CHANCE', statBonus: { chance: 2 } },
      { name: 'Bracelet de force', type: 'passive', possessed: true, effect: '+2 en DEXTÉRITÉ', statBonus: { dexterite: 2 } },

      // ACTIVE items (avec quantité pour tester l'affichage ×N)
      { name: 'Potion de soin', type: 'active', possessed: true, effect: 'Redonne 5 PV', healAmount: 5, quantity: 3, stackable: true },
      { name: 'Pomme verte', type: 'active', possessed: true, effect: 'Redonne 2 PV', healAmount: 2, quantity: 2, stackable: true },

      // WEAPON items
      { name: 'Épée courte (+1)', type: 'weapon', possessed: true, effect: '+1 de DOMMAGE', attackPoints: 1 },
      { name: 'Arc et carquois', type: 'weapon', possessed: true, effect: 'Arme à distance', attackPoints: 0 },

      // SPECIAL items
      { name: 'Bague de la deuxième chance', type: 'special', possessed: true, effect: 'Relance les dés', unique: true },
      { name: 'Anneau des échos', type: 'special', possessed: true, effect: 'Rejouer une scène', unique: true }
    ];

    console.log('🎯 Ajout des items de test...');

    // Ouvrir la base de données
    const openRequest = indexedDB.open('adventure-tome-db', 1);

    openRequest.onerror = function() {
      console.error('❌ Erreur lors de l\'ouverture de la base de données:', openRequest.error);
    };

    openRequest.onsuccess = function() {
      const db = openRequest.result;
      const transaction = db.transaction(['characters'], 'readwrite');
      const store = transaction.objectStore('characters');
      const getRequest = store.get(characterId);

      getRequest.onsuccess = function() {
        const character = getRequest.result;

        if (!character) {
          console.error('❌ Personnage non trouvé avec l\'ID:', characterId);
          return;
        }

        let addedCount = 0;

        // Ajouter tous les items
        itemsToAdd.forEach((item) => {
          const newItem = {
            id: `test-${Date.now()}-${Math.random().toString(36).substring(2)}`,
            ...item
          };
          character.inventory.items.push(newItem);
          addedCount++;
          console.log(`✅ ${item.name} (${item.type}) ajouté`);
        });

        character.updatedAt = new Date().toISOString();

        // Sauvegarder
        const putRequest = store.put(character);

        putRequest.onsuccess = function() {
          console.log(`📦 ${addedCount} items ajoutés avec succès !`);
          console.log('📝 Actualisez la page pour voir les items');
        };

        putRequest.onerror = function() {
          console.error('❌ Erreur lors de la sauvegarde:', putRequest.error);
        };
      };

      getRequest.onerror = function() {
        console.error('❌ Erreur lors de la lecture du personnage:', getRequest.error);
      };

      transaction.onerror = function() {
        console.error('❌ Erreur de transaction:', transaction.error);
      };
    };

    openRequest.onupgradeneeded = function() {
      console.log('⚠️ La base de données doit être mise à jour, mais ce ne devrait pas arriver');
    };

  };

  console.log('🎉 Script de test V2 chargé !');
  console.log('💡 Utilisez: addTestItems("<character-id>")');
  console.log('💡 L\'ID du personnage est dans l\'URL: /characters/<id>');
})();
